import { Hono } from 'hono';

import { prisma } from '../../../../../lib/prisma';
import { storageTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeStorageType } from '../lib/outputSerializer';
import { requestIdValidator } from '../../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
   try {
      // Get Request information
      const { id } = c.req.valid('param');

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
   } catch (err) {
      return internalServerError(c, err);
   }
});
