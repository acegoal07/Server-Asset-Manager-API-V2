import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';

export default new Hono().delete('/', requestIdValidator({}), async (c) => {
   try {
      // Get request information
      const { id } = c.req.valid('param');

      // Try and get the storage from the database
      const storage = await prisma.storages.findUnique({
         where: {
            id
         },
         select: {
            id: true
         }
      });

      // Check that the storage exists
      if (!storage) {
         return notFoundError(c, `Storage with id: ${id} could not be found.`);
      }

      // Delete the storage from the database
      await prisma.storages.delete({
         where: {
            id
         }
      });

      return c.body(null, 204);
   } catch (err) {
      return internalServerError(c, err);
   }
});
