import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import { customError, internalServerError, notFoundError } from '../../../../lib/errorMessages';
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
            include: {
               AssetData: true
            }
         });

         // Get types
         const assetType = await getAssetTypeByID(1);

         // Check the type exists
         if (!assetType) {
            return notFoundError(c, "Asset type can't be found");
         }

         const uuidFieldId = getAssetFieldByName(assetType, 'UUID')?.id;

         // Map existing node name -> existing node
         const existingNodeMap = new Map(existingNodes.map((asset) => [asset.name, asset]));

         // Nodes that don't exist
         const missingNodes = body
            .map((node) => node.nodeName)
            .filter((name) => !existingNodeMap.has(name));

         // Return nodes that don't exist
         if (missingNodes.length > 0) {
            return notFoundError(c, `The following nodes do not exist: ${missingNodes.join(', ')}`);
         }

         // Nodes that have already been initialised
         const initializedNodes = body
            .filter((node) => {
               const asset = existingNodeMap.get(node.nodeName);
               return asset?.AssetData.some((data) => data.fieldId === uuidFieldId);
            })
            .map((node) => node.nodeName);

         // Return the nodes that have been initialized
         if (initializedNodes.length > 0) {
            return customError(c, {
               error: 'ALREADY_INITIALIZED_NODE',
               message: `The following nodes have already been initialised: ${initializedNodes.join(', ')}`,
               code: 409
            });
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
                              fieldId: uuidFieldId!,
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
