import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';

export default new Hono().delete('/', requestIdValidator({}), async (c) => {
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

   // Delete the group
   await prisma.groups.delete({
      where: {
         id
      }
   });

   return c.body(null, 204);
});
