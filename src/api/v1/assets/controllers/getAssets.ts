import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { assetSerializerArgs, serializeAsset } from '../lib/serialisers';
import { assetQueryValidator } from '../lib/validators';
import { internalServerError } from '../../../../lib/errorMessages';

export default new Hono().get('/', assetQueryValidator, async (c) => {
   try {
      const query = c.req.valid('query');

      const assets = await prisma.assets.findMany({
         ...assetSerializerArgs,

         where: {
            ...(query.typeId !== undefined && {
               assetTypeId: query.typeId
            }),

            ...(query.type !== undefined && {
               AssetTypes: {
                  name: query.type
               }
            })
         }
      });

      return c.json(assets.map(serializeAsset));
   } catch (err) {
      return internalServerError(c, err);
   }
});
