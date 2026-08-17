import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import { customError, internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { checkMaskForSize, getIpFromMask } from '../../../../lib/ipMask';
import { getAssetFieldByName, getAssetTypeByID } from '../../../../lib/assetFields';
import { getNodeNameFromMask } from '../../../../lib/nameMask';

export default new Hono().post(
   '/',
   requestIdValidator({}),
   requestJsonValidator(
      z.object({
         additional: z
            .number({ error: 'Additional must be a number' })
            .int({ error: 'Additional must be a whole number' })
            .positive({ error: 'Additional must be greater than 0' })
      })
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
               size: true,
               ipMask: true,
               bmcIpMask: true
            }
         });

         // Check if a group exists
         if (!group) {
            return notFoundError(c, 'No group with that ID was found');
         }

         // Check ip mask supports size
         if (!checkMaskForSize(group.ipMask, group.size + body.additional)) {
            return customError(
               c,
               'INCOMPATIBLE_IP_MASK',
               'The IP mask provided does not support the size of the group.',
               null,
               400
            );
         }

         // Check bmc ip mask supports size
         if (group.bmcIpMask && !checkMaskForSize(group.bmcIpMask, group.size + body.additional)) {
            return customError(
               c,
               'INCOMPATIBLE_BMC_IP_MASK',
               'The BMC IP mask provided does not support the size of the group.',
               null,
               400
            );
         }

         // Update the group
         const updateGroup = await prisma.groups.update({
            where: {
               id
            },
            data: {
               size: group.size + body.additional
            }
         });

         // Get asset type
         const assetType = await getAssetTypeByID(1);

         // Create nodes
         for (let i = group.size + 1; i < group.size + body.additional + 1; i++) {
            await prisma.assets.create({
               data: {
                  groupId: updateGroup.id,
                  assetTypeId: 1,
                  name: getNodeNameFromMask(updateGroup.nameMask, i),
                  AssetData: {
                     create: [
                        {
                           fieldId: getAssetFieldByName(assetType, 'IPAddress')!.id,
                           value: getIpFromMask(updateGroup.ipMask, i)
                        },
                        {
                           fieldId: getAssetFieldByName(assetType, 'BMC IP')!.id,
                           value: !updateGroup.bmcIpMask
                              ? ''
                              : getIpFromMask(updateGroup.bmcIpMask, i)
                        }
                     ]
                  }
               }
            });
         }

         return c.json(serializeGroup(updateGroup));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
