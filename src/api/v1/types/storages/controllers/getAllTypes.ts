import { Hono } from 'hono';

import { prisma } from '../../../../../lib/prisma';
import { storageTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeStorageType } from '../lib/outputSerializer';
import { internalServerError } from '../../../../../lib/errorMessages';

export default new Hono().get('/', async (c) => {
   try {
      const types = await prisma.storageTypes.findMany({
         ...storageTypeSerializerArgs,
         orderBy: {
            id: 'asc'
         }
      });

      return c.json(types.map(serializeStorageType));
   } catch (err) {
      return internalServerError(c, err);
   }
});
