import { Hono } from 'hono';

import { prisma } from '../../../../../lib/prisma';
import { assetTypeSerializerArgs } from '../lib/includeSerializer';
import { serializeAssetType } from '../lib/outputSerializer';
import { requestIdValidator } from '../../../../../lib/requestValidators';
import { notFoundError } from '../../../../../lib/errorMessages';

export default new Hono().get('/', requestIdValidator, async (c) => {
   // Get Request information
   const { id } = c.req.valid('param');

   // Get the type from the database
   const type = await prisma.assetTypes.findUnique({
      where: {
         id
      },
      ...assetTypeSerializerArgs
   });

   // Check if a type exists
   if (!type) {
      return notFoundError(c, 'No type with that ID was found');
   }

   return c.json(serializeAssetType(type));
});
