import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../../lib/prisma';
import { assetTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeAssetType } from '../lib/outputSerializer';
import { requestJsonValidator } from '../../../../../lib/requestValidators';
import { existingResourceError, internalServerError } from '../../../../../lib/errorMessages';

export default new Hono().post(
   '/',
   requestJsonValidator(
      z.object({
         name: z
            .string({ error: 'Name must be a string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' }),
         fields: z
            .array(
               z.object({
                  name: z
                     .string({ error: 'Name must be a string' })
                     .trim()
                     .min(1, { error: 'Name cannot be empty' }),
                  type: z
                     .string({ error: 'Type must be a string' })
                     .trim()
                     .min(1, { error: 'Type cannot be empty' })
               })
            )
            .default([])
      })
   ),
   async (c) => {
      try {
         // Get request information
         const body = c.req.valid('json');

         // Check if a type with the same name exists
         const existingType = await prisma.assetTypes.findUnique({
            where: {
               name: body.name
            },
            select: {
               id: true
            }
         });

         // Check if a type already exists
         if (existingType) {
            return existingResourceError(c, 'A type with that name already exists');
         }

         // Create the type
         const newType = await prisma.assetTypes.create({
            data: {
               name: body.name,
               AssetTypeFields: {
                  createMany: {
                     data: body.fields?.map((field) => ({
                        name: field.name,
                        type: field.type
                     }))
                  }
               }
            },
            ...assetTypeSerializerArgs
         });

         return c.json(serializeAssetType(newType), 201);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
