import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { storageSerializerArgs, serializeStorage } from '../lib/serialisers';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
   try {
      const { id } = c.req.valid('param');

      const storage = await prisma.storages.findUnique({
         where: {
            id
         },
         ...storageSerializerArgs
      });

      if (!storage) {
         return notFoundError(c, `Storage with id: ${id} could not be found.`);
      }

      return c.json(serializeStorage(storage));
   } catch (err) {
      return internalServerError(c, err);
   }
});
