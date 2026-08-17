import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { internalServerError } from '../../../../lib/errorMessages';
import { requestQueryValidator } from '../../../../lib/requestValidators';
import { storageSerializerArgs } from '../lib/includeSerializers';
import { serializeStorage } from '../lib/outputSerializers';

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

         // Get all the storages
         const storages = await prisma.storages.findMany({
            ...storageSerializerArgs,
            where: {
               ...(query.typeId !== undefined && {
                  storageTypeId: query.typeId
               }),
               ...(query.type !== undefined && {
                  StorageTypes: {
                     name: query.type
                  }
               })
            }
         });

         return c.json(storages.map(serializeStorage));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
