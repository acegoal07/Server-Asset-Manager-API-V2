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
