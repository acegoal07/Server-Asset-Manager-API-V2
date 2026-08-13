import { Hono } from 'hono';

import { prisma } from '../../../../../lib/prisma';
import { storageTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeStorageType } from '../lib/outputSerializer';
import { requestQueryValidator } from '../../../../../lib/requestValidators';
import { z } from 'zod';
import { notFoundError } from '../../../../../lib/errorMessages';

export default new Hono().get(
   '/',
   requestQueryValidator(
      z.object({
         id: z.coerce
            .number({ error: 'ID must be a number' })
            .int({ error: 'ID must be a whole number' })
            .positive({ error: 'ID must be greater than 0' })
      })
   ),
   async (c) => {
      // Get Request information
      const { id } = c.req.valid('query');

      // Get the type from the database
      const type = await prisma.storageTypes.findUnique({
         where: {
            id
         },
         ...storageTypeSerializerArgs
      });

      // Check if a type exists
      if (!type) {
         return notFoundError(c, 'No type with that ID was found');
      }

      return c.json(serializeStorageType(type));
   }
);
