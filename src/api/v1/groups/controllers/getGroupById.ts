import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
   try {
      // Get Request information
      const { id } = c.req.valid('param');

      // Get the group from the database
      const group = await prisma.groups.findUnique({
         where: {
            id
         }
      });

      // Check if a group exists
      if (!group) {
         return notFoundError(c, 'No group with that ID was found');
      }

      return c.json(serializeGroup(group));
   } catch (err) {
      return internalServerError(c, err);
   }
});
