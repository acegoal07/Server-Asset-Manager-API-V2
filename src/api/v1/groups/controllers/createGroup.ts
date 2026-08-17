import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestJsonValidator } from '../../../../lib/requestValidators';
import {
   existingResourceError,
   internalServerError,
   notFoundError
} from '../../../../lib/errorMessages';
import { getNodeNameFromMask } from '../../../../lib/nameMask';
import { getIpFromMask } from '../../../../lib/ipMask';
import { getAssetTypeByID, getAssetFieldByName } from '../../../../lib/assetFields';

export default new Hono().post(
   '/',
   requestJsonValidator(
      z.object({
         name: z
            .string({ error: 'Name must be a string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' }),
         size: z
            .number({ error: 'Size must be a number' })
            .int({ error: 'Size must be a whole number' })
            .min(1, { error: 'Size must be greater than 0' }),
         nameMask: z
            .string({ error: 'Name mask must be a string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' }),
         ipMask: z
            .string({ error: 'IP mask must be a string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' }),
         bmcUsername: z
            .string({ error: 'BMC username must be a string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' }),
         bmcPassword: z
            .string({ error: 'BMC password must be a string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' }),
         bmcIpMask: z
            .string({ error: 'BMC IP mask must be a string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' })
      })
   ),
   async (c) => {
      try {
         // Get request information
         const body = c.req.valid('json');

         // Check if a group with the same name exists
         const existingGroup = await prisma.groups.findUnique({
            where: {
               name: body.name
            },
            select: {
               id: true
            }
         });

         // Check if a group exists
         if (existingGroup) {
            return existingResourceError(c, 'A group with that name already exists');
         }

         // Get types
         const assetType = await getAssetTypeByID(1);

         // Check the type exists
         if (!assetType) {
            return notFoundError(c, "Asset type can't be found");
         }

         // Create the new group
         const newGroup = await prisma.groups.create({
            data: {
               name: body.name,
               size: body.size,
               nameMask: body.nameMask,
               ipMask: body.ipMask,
               bmcUsername: body.bmcUsername,
               bmcPassword: body.bmcPassword,
               bmcIpMask: body.bmcIpMask
            }
         });

         // Create nodes
         for (let i = 1; i < body.size; i++) {
            await prisma.assets.create({
               data: {
                  groupId: newGroup.id,
                  assetTypeId: 1,
                  name: getNodeNameFromMask(body.nameMask, i),
                  AssetData: {
                     create: [
                        {
                           fieldId: getAssetFieldByName(assetType, 'IPAddress')!.id,
                           value: getIpFromMask(body.ipMask, i)
                        },
                        {
                           fieldId: getAssetFieldByName(assetType, 'BMC IP')!.id,
                           value: getIpFromMask(body.bmcIpMask, i)
                        }
                     ]
                  }
               }
            });
         }

         return c.json(serializeGroup(newGroup), 201);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
