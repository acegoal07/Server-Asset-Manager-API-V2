import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestQueryValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';

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
      const group = await prisma.groups.findUnique({
         where: {
            id
         }
      });

      // Check if a type exists
      if (!group) {
         return notFoundError(c, 'No group with that ID was found');
      }

      return c.json(serializeGroup(group));
   }
);
