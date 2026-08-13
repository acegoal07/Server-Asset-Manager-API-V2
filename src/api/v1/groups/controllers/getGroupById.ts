import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
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
});
