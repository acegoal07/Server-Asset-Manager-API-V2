import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   ConflictErrorSchema,
   InternalServerErrorSchema
} from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      tags: ['v1-Domains'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: z.object({
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
               }
            }
         }
      },
      responses: {
         201: {
            description: 'Domain successfully created',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
                     name: z.string()
                  })
               }
            }
         },
         ...BadRequestErrorSchema,
         ...ConflictErrorSchema,
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
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
                           identifier: field.name.toLowerCase().replaceAll(' ', '-'),
                           value: field.value,
                           type: field.type
                        }))
                     }
                  }
               }
            }
         }
      });

      return c.json(newDomain, 201);
   }
);
