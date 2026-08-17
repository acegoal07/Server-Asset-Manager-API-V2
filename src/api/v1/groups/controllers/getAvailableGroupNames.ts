import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { getAssetTypeByID, getFieldByName } from '../../../../lib/assetFields';

export default new Hono().get('/', requestIdValidator({}), async (c) => {
   try {
      // Get Request information
      const { id } = c.req.valid('param');

      // Get the group from the database
      const group = await prisma.groups.findUnique({
         where: {
            id
         }
      });

      // Check if a group exists
      if (!group) {
         return notFoundError(c, 'No group with that ID was found');
      }

      // Get types

      const assetType = await getAssetTypeByID(1);

      // Check the type exists
      if (!assetType) {
         return notFoundError(c, "Asset type can't be found");
      }

      // Get all the nodes from the group
      const groupNodes = await prisma.assets.findMany({
         where: {
            groupId: id
         },
         include: {
            AssetData: true
         }
      });

      return c.json(
         groupNodes.map((node) => ({
            name: node.name,
            available: !node.AssetData.some(
               (data) => data.fieldId === getFieldByName(assetType, 'UUID')?.id
            )
         }))
      );
   } catch (err) {
      return internalServerError(c, err);
   }
});
