import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestJsonValidator, requestQueryValidator } from '../../../../lib/requestValidators';
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
   requestJsonValidator(
      z.object({
         additional: z
            .number({ error: 'Additional must be a number' })
            .int({ error: 'Additional must be a whole number' })
            .positive({ error: 'Additional must be greater than 0' })
      })
   ),
   async (c) => {
      // Get Request information
      const { id } = c.req.valid('query');
      const body = c.req.valid('json');

      // Get the group from the database
      const group = await prisma.groups.findUnique({
         where: {
            id
         },
         select: {
            size: true
         }
      });

      // Check if a group exists
      if (!group) {
         return notFoundError(c, 'No group with that ID was found');
      }

      // Update the group
      const updateGroup = await prisma.groups.update({
         where: {
            id
         },
         data: {
            size: group.size + body.additional
         }
      });

      return c.json(serializeGroup(updateGroup));
   }
);
