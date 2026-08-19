import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      description: 'Creates a new primary gender',
      tags: ['Genders'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: z.object({
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
                        .default([])
                  })
               }
            }
         }
      },
      responses: {
         201: {
            description: 'Gender successfully created',
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
         ...NotFoundErrorSchema,
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
      try {
         // Get request information
         const body = c.req.valid('json');

         // Try and get the domain from the database
         const domain = await prisma.domains.findUnique({
            where: {
               id: body.domainId
            },
            include: {
               _count: {
                  select: {
                     PrimaryGenders: true
                  }
               }
            }
         });

         // Check if the domain exists
         if (!domain) {
            return notFoundError(c);
         }

         // Create the new primary gender
         const newGender = await prisma.primaryGenders.create({
            data: {
               name: body.name,
               genderIndex: domain._count.PrimaryGenders + 1,
               Domains: {
                  connect: {
                     id: body.domainId
                  }
               },
               Data: {
                  create: {
                     DataFields: {
                        createMany: {
                           data: [
                              ...body.dataFields.map((field) => ({
                                 name: field.name,
                                 identifier: field.name.toLowerCase().replaceAll(' ', '-'),
                                 value: field.value,
                                 type: field.type
                              })),
                              {
                                 name: 'Node count',
                                 identifier: 'node-count',
                                 value: body.nodeCount.toString(),
                                 type: 'number'
                              },
                              {
                                 name: 'Node name mask',
                                 identifier: 'node-name-mask',
                                 value: body.nodeNameMask,
                                 type: 'string'
                              },
                              {
                                 name: 'Node IP mask',
                                 identifier: 'node-ip-mask',
                                 value: body.nodeIpMask,
                                 type: 'string'
                              }
                           ]
                        }
                     }
                  }
               }
            }
         });

         return c.json(newGender, 201);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
