import { Hono } from 'hono';

import { prisma } from '../../../../../lib/prisma';
import { assetTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeAssetType } from '../lib/outputSerializer';

export default new Hono().get('/', async (c) => {
   const assetTypes = await prisma.assetTypes.findMany({
      ...assetTypeSerializerArgs,
      orderBy: {
         id: 'asc'
      }
   });

   return c.json(assetTypes.map(serializeAssetType));
});
