import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';

export default new Hono().delete('/', requestIdValidator({}), async (c) => {
   const { id } = c.req.valid('param');

   const storage = await prisma.storages.findUnique({
      where: {
         id
      }
   });

   if (!storage) {
      return notFoundError(c, `Storage with id: ${id} could not be found.`);
   }

   await prisma.storages.delete({
      where: {
         id
      }
   });

   return c.body(null, 204);
});
