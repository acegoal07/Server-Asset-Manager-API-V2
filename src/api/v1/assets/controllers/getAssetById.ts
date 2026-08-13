import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { assetSerializerArgs, serializeAsset } from '../lib/serialisers';
import { requestIdValidator } from '../../../../lib/requestValidators';

export default new Hono().get('/', requestIdValidator, async (c) => {
   const { id } = c.req.valid('param');

   const asset = await prisma.assets.findUnique({
      where: {
         id
      },
      ...assetSerializerArgs
   });

   if (!asset) {
      return c.json(
         {
            error: 'Asset not found'
         },
         404
      );
   }

   return c.json(serializeAsset(asset));
});
