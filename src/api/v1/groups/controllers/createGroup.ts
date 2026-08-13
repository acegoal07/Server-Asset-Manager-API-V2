import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { requestJsonValidator } from '../../../../lib/requestValidators';
import { existingResourceError } from '../../../../lib/errorMessages';

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

      return c.json(serializeGroup(newGroup));
   }
);
