import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { assetSerializerArgs, serializeAsset } from '../lib/serialisers';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
   try {
      const { id } = c.req.valid('param');

      const asset = await prisma.assets.findUnique({
         where: {
            id
         },
         ...assetSerializerArgs
      });

      if (!asset) {
         return notFoundError(c, `Asset with id: ${id} could not be found.`);
      }

      return c.json(serializeAsset(asset));
   } catch (err) {
      return internalServerError(c, err);
   }
});
