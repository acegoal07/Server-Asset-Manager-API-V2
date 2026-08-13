import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';

export default new Hono().get('/', requestIdValidator, async (c) => {
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
   const assetType = await prisma.assetTypes.findUnique({
      where: {
         id: 1
      },
      include: {
         AssetTypeFields: true
      }
   });

   // Check the type exists
   if (!assetType) {
      return notFoundError(c, "Asset type can't be found");
   }

   // Type field names
   const fieldsByName = new Map(assetType.AssetTypeFields.map((field) => [field.name, field]));

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
         available: !node.AssetData.some((data) => data.fieldId === fieldsByName.get('UUID')?.id)
      }))
   );
});
