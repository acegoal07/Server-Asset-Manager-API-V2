import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { storageSerializerArgs } from '../lib/includeSerializers';
import { serializeStorage } from '../lib/outputSerializers';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
   try {
      // Get the request information
      const { id } = c.req.valid('param');

      // Try and get the storage from the database
      const storage = await prisma.storages.findUnique({
         where: {
            id
         },
         ...storageSerializerArgs
      });

      // Check to make sure the storage exists
      if (!storage) {
         return notFoundError(c, `Storage with id: ${id} could not be found.`);
      }

      return c.json(serializeStorage(storage));
   } catch (err) {
      return internalServerError(c, err);
   }
});
