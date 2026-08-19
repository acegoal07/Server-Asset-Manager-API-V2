import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import { CreateDataFieldSchema } from '../../../../../lib/dataFieldHelpers';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      description: 'Creates a new sub gender',
      tags: ['Sub Genders'],
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
                     dataFields: z.array(CreateDataFieldSchema).default([])
                  })
               }
            }
         }
      },
      responses: {
         201: {
            description: 'Sub gender successfully created',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
                     domainId: z.number(),
                     dataId: z.number(),
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
         const newGender = await prisma.subGenders.create({
            data: {
               name: body.name,
               Domains: {
                  connect: {
                     id: body.domainId
                  }
               },
               Data: {
                  create: {
                     DataFields: {
                        createMany: {
                           data: body.dataFields.map((field) => ({
                              name: field.name,
                              type: field.type,
                              value: field.value,
                              identifier: field.name.toLowerCase().replaceAll(' ', '-')
                           }))
                        }
                     }
                  }
               }
            }
         });

         return c.json(
            {
               id: newGender.id,
               domainId: newGender.domainId,
               dataId: newGender.dataId,
               name: newGender.name
            },
            201
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
