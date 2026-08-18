import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { internalServerError } from '../../../../lib/errorMessages';
import { requestQueryValidator } from '../../../../lib/requestValidators';
import { assetSerializerArgs } from '../lib/includeSerializers';
import { serializeAsset } from '../lib/outputSerializers';

export default new Hono().get(
   '/',
   requestQueryValidator(
      z.object({
         typeId: z.coerce
            .number({ error: 'Type ID must be a number' })
            .int({ error: 'Type ID must be an integer' })
            .positive({ error: 'Type ID must be greater than 0' })
            .optional(),
         type: z
            .string({ error: 'Type must be a string' })
            .min(1, { error: 'Type cannot be empty' })
            .optional()
      })
   ),
   async (c) => {
      try {
         // Get the request information
         const query = c.req.valid('query');

         // Get the assets from the database
         const assets = await prisma.assets.findMany({
            ...assetSerializerArgs,
            where: {
               ...(query.typeId !== undefined && {
                  assetTypeId: query.typeId
               }),
               ...(query.type !== undefined && {
                  AssetTypes: {
                     name: query.type
                  }
               })
            }
         });

         return c.json(assets.map(serializeAsset));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
