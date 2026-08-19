import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   ConflictErrorSchema,
   InternalServerErrorSchema
} from '../../../../../lib/openApiSchemas';
import { existingResourceError } from '../../../../../lib/errorMessages';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      description: 'Creates a new domain',
      tags: ['Domains'],
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

      // Try and get a domain with the same name
      const existingDomain = await prisma.domains.findFirst({
         where: {
            name: body.name
         }
      });

      // Check if a domain exists
      if (existingDomain) {
         return existingResourceError(c, 'A domain with that name already exists');
      }

      // Create the new domain
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
