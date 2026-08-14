import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { requestIdValidator } from '../../../../lib/requestValidators';
import { notFoundError } from '../../../../lib/errorMessages';
import { z } from 'zod';

export default new Hono().get(
   '/',
   requestIdValidator({
      uuid: z
         .string({ error: 'UUID must be a string' })
         .trim()
         .min(1, { error: 'UUID cannot be empty' })
   }),
   async (c) => {
      // Get Request information
      const { id, uuid } = c.req.valid('param');

      // Get the group from the database
      const group = await prisma.groups.findUnique({
         where: {
            id
         },
         select: {
            id: true
         }
      });

      // Check if a group exists
      if (!group) {
         return notFoundError(c, 'No group with that ID was found');
      }

      // Get the node
      const node = await prisma.assets.findFirst({
         where: {
            groupId: id,
            AssetData: {
               some: {
                  value: uuid,
                  AssetTypeFields: {
                     name: 'UUID'
                  }
               }
            }
         },
         include: {
            AssetData: {
               include: {
                  AssetTypeFields: true
               }
            }
         }
      });

      // Check the node exists
      if (!node) {
         return notFoundError(c, 'No node was found with that ID');
      }

      return c.json({
         id: node.id,
         name: node.name,
         data: node.AssetData.map((data) => ({
            name: data.AssetTypeFields.name,
            value: data.value,
            type: data.AssetTypeFields.type
         }))
      });
   }
);
