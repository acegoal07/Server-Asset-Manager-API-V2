import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import {
   existingResourceError,
   internalServerError,
   notFoundError
} from '../../../../lib/errorMessages';

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
            size: z
               .number({ error: 'Size must be a number' })
               .int({ error: 'Size must be a whole number' })
               .min(1, { error: 'Size must be greater than 0' })
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

         // Update the group
         const updatedGroup = await prisma.groups.update({
            where: {
               id
            },
            data: {
               name: body.name ?? existingGroup.name,
               size: body.size ?? existingGroup.size,
               nameMask: body.nameMask ?? existingGroup.nameMask,
               ipMask: body.ipMask ?? existingGroup.ipMask,
               bmcUsername: body.bmcUsername ?? existingGroup.bmcUsername,
               bmcPassword: body.bmcPassword ?? existingGroup.bmcPassword,
               bmcIpMask: body.bmcIpMask ?? existingGroup.bmcIpMask
            }
         });

         return c.json(serializeGroup(updatedGroup));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
