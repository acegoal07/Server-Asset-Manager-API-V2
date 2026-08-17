import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';

export default new Hono().delete('/', requestIdValidator({}), async (c) => {
   try {
      // Get request information
      const { id } = c.req.valid('param');

      // Try and get asset from the database
      const asset = await prisma.assets.findUnique({
         where: {
            id
         }
      });

      // Check if the asset exists
      if (!asset) {
         return notFoundError(c, `Asset with id: ${id} could not be found.`);
      }

      // Delete the asset from the database
      await prisma.assets.delete({
         where: {
            id
         }
      });

      return c.body(null, 204);
   } catch (err) {
      return internalServerError(c, err);
   }
});
