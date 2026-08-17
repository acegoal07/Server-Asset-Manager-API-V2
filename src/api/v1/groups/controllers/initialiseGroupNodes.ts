import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { getAssetTypeByID, getAssetFieldByName } from '../../../../lib/assetFields';

export default new Hono().post(
   '/',
   requestIdValidator({}),
   requestJsonValidator(
      z
         .array(
            z.object({
               nodeName: z
                  .string({ error: 'Node name must be a string' })
                  .trim()
                  .min(1, { error: 'Node name cannot be empty' }),
               uuid: z
                  .string({ error: 'UUID must be a string' })
                  .trim()
                  .min(1, { error: 'UUID cannot be empty' })
            })
         )
         .min(1, { error: 'At least one node needs to be provided for initialise' })
   ),
   async (c) => {
      try {
         // Get Request information
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Get the group from the database
         const group = await prisma.groups.findUnique({
            where: {
               id
            },
            select: {
               id: true
            }
         });

         // Check that the group exists
         if (!group) {
            return notFoundError(c, 'No group with that ID was found');
         }

         // Get the assets from the database
         const nodeNames = body.map((asset) => asset.nodeName);
         const existingNodes = await prisma.assets.findMany({
            where: {
               name: {
                  in: nodeNames
               }
            },
            select: {
               name: true
            }
         });

         // Check for missing nodes
         const existingNodeNames = new Set(existingNodes.map((asset) => asset.name));
         const missingNodes = nodeNames.filter((name) => !existingNodeNames.has(name));

         if (missingNodes.length > 0) {
            return notFoundError(c, `The following nodes do not exist: ${missingNodes.join(', ')}`);
         }

         // Get types
         const assetType = await getAssetTypeByID(1);

         // Check the type exists
         if (!assetType) {
            return notFoundError(c, "Asset type can't be found");
         }

         // Add the UUID to all the nodes
         await prisma.$transaction(
            body.map((asset) =>
               prisma.assets.update({
                  where: {
                     groupId_name: {
                        groupId: id,
                        name: asset.nodeName
                     }
                  },
                  data: {
                     AssetData: {
                        create: [
                           {
                              fieldId: getAssetFieldByName(assetType, 'UUID')!.id,
                              value: asset.uuid
                           }
                        ]
                     }
                  }
               })
            )
         );

         return c.json(null, 201);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
