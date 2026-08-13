import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { requestJsonValidator, requestQueryValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';

export default new Hono().get(
   '/',
   requestQueryValidator(
      z.object({
         id: z.coerce
            .number({ error: 'ID must be a number' })
            .int({ error: 'ID must be a whole number' })
            .positive({ error: 'ID must be greater than 0' })
      })
   ),
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
      // Get Request information
      const { id } = c.req.valid('query');
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

      // Add the UUID to all the nodes
      await prisma.$transaction(
         body.map((asset) =>
            prisma.assets.update({
               where: {
                  groupId_name: {
                     groupId: 1,
                     name: 'foo',
                  },
               },
               data: {
                  AssetData: {
                     create: [
                        {
                           fieldId: fieldsByName.get('UUID')!.id,
                           value: asset.uuid
                        }
                     ]
                  }
               }
            })
         )
      );

      return c.body(null, 201);
   }
);
