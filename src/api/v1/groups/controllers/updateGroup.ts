import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import {
   customError,
   existingResourceError,
   internalServerError,
   notFoundError
} from '../../../../lib/errorMessages';
import { checkMaskForSize } from '../../../../lib/ipMask';

export default new Hono().patch(
   '/',
   requestIdValidator({}),
   requestJsonValidator(
      z
         .object({
            name: z
               .string({ error: 'Name must be a string' })
               .trim()
               .min(1, { error: 'Name cannot be empty' })
               .optional(),
            nameMask: z
               .string({ error: 'Name mask must be a string' })
               .trim()
               .min(1, { error: 'Name cannot be empty' })
               .optional(),
            ipMask: z
               .string({ error: 'IP mask must be a string' })
               .trim()
               .min(1, { error: 'Name cannot be empty' })
               .optional(),
            bmcUsername: z
               .string({ error: 'BMC username must be a string' })
               .trim()
               .min(1, { error: 'Name cannot be empty' })
               .optional(),
            bmcPassword: z
               .string({ error: 'BMC password must be a string' })
               .trim()
               .min(1, { error: 'Name cannot be empty' })
               .optional(),
            bmcIpMask: z
               .string({ error: 'BMC IP mask must be a string' })
               .trim()
               .min(1, { error: 'Name cannot be empty' })
               .optional()
         })
         .refine((data) => Object.keys(data).length > 0, {
            error: 'At least one field must be provided'
         })
   ),
   async (c) => {
      try {
         // Get Request information
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Get the group from the database
         const existingGroup = await prisma.groups.findUnique({
            where: {
               id
            },
            select: {
               id: true,
               size: true
            }
         });

         // Check that the group exists
         if (!existingGroup) {
            return notFoundError(c, 'No group with that ID was found');
         }

         // If there is a new name check it doesn't already exists
         if (body.name) {
            const existingGroup = await prisma.groups.findUnique({
               where: {
                  name: body.name
               },
               select: {
                  id: true
               }
            });

            if (existingGroup) {
               return existingResourceError(c, 'A group already exists with that name');
            }
         }

         // If there is a new IP mask validate it supports the size
         if (body.ipMask) {
            if (!checkMaskForSize(body.ipMask, existingGroup.size)) {
               return customError(
                  c,
                  'INCOMPATIBLE_IP_MASK',
                  'The IP mask provided does not support the size of the group.',
                  null,
                  400
               );
            }
         }

         // If there is a new BMC IP mask validate it supports the size
         if (body.bmcIpMask) {
            // Check bmc ip mask supports size
            if (!checkMaskForSize(body.bmcIpMask, existingGroup.size)) {
               return customError(
                  c,
                  'INCOMPATIBLE_BMC_IP_MASK',
                  'The BMC IP mask provided does not support the size of the group.',
                  null,
                  400
               );
            }
         }

         // Update the group
         const updatedGroup = await prisma.groups.update({
            where: {
               id
            },
            data: {
               ...(body.name !== undefined && {
                  name: body.name
               }),
               ...(body.nameMask !== undefined && {
                  nameMask: body.nameMask
               }),
               ...(body.ipMask !== undefined && {
                  ipMask: body.ipMask
               }),
               ...(body.bmcUsername !== undefined && {
                  bmcUsername: body.bmcUsername
               }),
               ...(body.bmcPassword !== undefined && {
                  bmcPassword: body.bmcPassword
               }),
               ...(body.bmcIpMask !== undefined && {
                  bmcIpMask: body.bmcIpMask
               })
            }
         });

         return c.json(serializeGroup(updatedGroup));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
