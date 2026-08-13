import { Hono } from 'hono';

import { prisma } from '../../../lib/prisma';
import { assetTypeSerializerArgs, serializeAssetType } from '../lib/serialisers';

export default new Hono().get('/:id', async (c) => {
   const id = Number(c.req.param('id'));

   if (!Number.isInteger(id) || id <= 0) {
      return c.json(
         {
            error: 'Invalid asset type ID'
         },
         400
      );
   }

   const assetType = await prisma.assetTypes.findUnique({
      where: {
         id
      },
      ...assetTypeSerializerArgs
   });

   if (!assetType) {
      return c.json(
         {
            error: 'Asset type not found'
         },
         404
      );
   }

   return c.json(serializeAssetType(assetType));
});
