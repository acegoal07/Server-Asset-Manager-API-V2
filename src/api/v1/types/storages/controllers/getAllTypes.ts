import { Hono } from 'hono';

import { prisma } from '../../../../../lib/prisma';
import { storageTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeStorageType } from '../lib/outputSerializer';

export default new Hono().get('/', async (c) => {
   const assetTypes = await prisma.storageTypes.findMany({
      ...storageTypeSerializerArgs,
      orderBy: {
         id: 'asc'
      }
   });

   return c.json(assetTypes.map(serializeStorageType));
});
