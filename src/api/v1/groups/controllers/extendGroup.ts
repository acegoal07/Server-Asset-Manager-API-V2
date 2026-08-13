import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';

export default new Hono().get(
   '/',
   requestIdValidator({}),
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
      const { id } = c.req.valid('param');
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
