import { Hono } from 'hono';
import { lowercase, z } from 'zod';

import { requestJsonValidator } from '../../../../../lib/requestValidators';
import { prisma } from '../../../../../lib/prisma';
import fi from 'zod/v4/locales/fi.cjs';

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
            .default([])
      })
   ),
   async (c) => {
      // Get request information
      const body = c.req.valid('json');

      const newDomain = await prisma.domains.create({
         data: {
            name: body.name,
            Data: {
               create: {
                  DataFields: {
                     createMany: {
                        data: body.dataFields.map((field) => ({
                           name: field.name,
                           identifier: field.name.toLowerCase().replaceAll(" ", "-"),
                           value: field.value,
                           type: field.type
                        }))
                     }
                  }
               }
            }
         }
      });

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
