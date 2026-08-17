import { Hono } from 'hono';

import { prisma } from '../../../../../lib/prisma';
import { assetTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeAssetType } from '../lib/outputSerializer';
import { internalServerError } from '../../../../../lib/errorMessages';

export default new Hono().get('/', async (c) => {
   try {
      const types = await prisma.assetTypes.findMany({
         ...assetTypeSerializerArgs,
         orderBy: {
            id: 'asc'
         }
      });

      return c.json(types.map(serializeAssetType));
   } catch (err) {
      return internalServerError(c, err);
   }
});
