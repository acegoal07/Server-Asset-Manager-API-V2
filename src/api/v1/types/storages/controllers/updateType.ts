import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../../lib/prisma';
import { storageTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeStorageType } from '../lib/outputSerializer';
import { requestIdValidator, requestJsonValidator } from '../../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';

export default new Hono().patch(
   '/',
   requestIdValidator({}),
   requestJsonValidator(
      z
         .object({
            name: z
               .string({ error: 'Name must be a string' })
               .trim()
               .min(1, { error: 'Name cannot be empty' })
               .optional(),
            deleteFields: z
               .array(
                  z
                     .number({ error: 'The ID must be a number' })
                     .min(1, { error: 'ID must be greater than 0' })
               )
               .default([]),
            addFields: z
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
         .refine((data) => Object.keys(data).length > 0, {
            error: 'At least one field must be provided'
         })
   ),
   async (c) => {
      try {
         // Get request information
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Try and get the type from the database

         const existingType = await prisma.storageTypes.findUnique({
            where: {
               id
            },
            select: {
               id: true
            }
         });

         // Check that the type exists
         if (!existingType) {
            return notFoundError(c, 'No type with that ID was found');
         }

         // Update type
         const updatedType = await prisma.storageTypes.update({
            where: {
               id
            },
            data: {
               ...(body.name !== undefined && {
                  name: body.name
               }),
               StorageTypeFields: {
                  ...(body.deleteFields.length > 0 && {
                     deleteMany: body.deleteFields?.map((id) => ({
                        id
                     }))
                  }),
                  ...(body.addFields.length > 0 && {
                     createMany: {
                        data: body.addFields?.map((field) => ({
                           name: field.name,
                           type: field.type
                        }))
                     }
                  })
               }
            },
            ...storageTypeSerializerArgs
         });

         return c.json(serializeStorageType(updatedType));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
