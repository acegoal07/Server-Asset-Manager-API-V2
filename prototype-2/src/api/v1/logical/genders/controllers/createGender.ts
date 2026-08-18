import { Hono } from 'hono';
import { z } from 'zod';

import { requestJsonValidator } from '../../../../../lib/requestValidators';

export default new Hono().post(
   '/',
   requestJsonValidator(
      z.object({
         name: z
            .string({ error: 'Name must be string' })
            .trim()
            .min(1, { error: 'Name cannot be empty' }),
         domainId: z
            .number({ error: 'Domain ID must be a number' })
            .int({ error: 'Domain ID must be an integer' })
            .positive({ error: 'Domain ID must be greater than 0' }),
         nodeNameMask: z
            .string({ error: 'Node name mask must be a string' })
            .trim()
            .min(1, { error: 'Node name mask cannot be empty' }),
         nodeIpMask: z
            .string({ error: 'Node IP mask must be a string' })
            .trim()
            .min(1, { error: 'Node IP mask cannot be empty' }),
         nodeCount: z
            .number({ error: 'Node count must be a number' })
            .int({ error: 'Node count must be an integer' })
            .positive({ error: 'Node count must be greater than 0' }),
         dataFields: z
            .array(
               z.object({
                  name: z
                     .string({ error: 'Name must be string' })
                     .trim()
                     .min(1, { error: 'Name cannot be empty' }),
                  type: z
                     .string({ error: 'Type must be string' })
                     .trim()
                     .min(1, { error: 'Type cannot be empty' }),
                  value: z
                     .string({ error: 'Value must be string' })
                     .trim()
                     .min(1, { error: 'Value cannot be empty' })
               })
            )
            .optional()
      })
   ),
   async (c) => {
      // Get request information
      const body = c.req.valid('json');

      // Get the index from how many genders a domain has + 1
      // Create the dataField link?
      // const domain = await prisma.domains.create({
      //    data: {
      //       name: "example.com",
      //       data: {
      //          create: {},
      //       },
      //    },
      // });
   }
);
