import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { assetSerializerArgs } from '../lib/includeSerializers';
import { serializeAsset } from '../lib/outputSerializers';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
   try {
      // Get request information
      const { id } = c.req.valid('param');

      // Try and get the asset from the database
      const asset = await prisma.assets.findUnique({
         where: {
            id
         },
         ...assetSerializerArgs
      });

      // Check if the asset exists
      if (!asset) {
         return notFoundError(c, `Asset with id: ${id} could not be found.`);
      }

      return c.json(serializeAsset(asset));
   } catch (err) {
      return internalServerError(c, err);
   }
});
