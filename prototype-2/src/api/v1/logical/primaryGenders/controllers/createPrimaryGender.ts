import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   ConflictErrorSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import {
   customError,
   existingResourceError,
   internalServerError,
   notFoundError
} from '../../../../../lib/errorMessages';
import { CreateDataFieldSchema } from '../../../../../lib/dataFieldHelpers';
import { checkIpMaskForSize } from '../../../../../lib/ipMask';
import { checkNameMaskForSize } from '../../../../../lib/nameMask';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      description: 'Creates a new primary gender',
      tags: ['Primary Genders'],
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
                     dataFields: z.array(CreateDataFieldSchema).default([])
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
                     domainId: z.number(),
                     name: z.string(),
                     genderIndex: z.number()
                  })
               }
            }
         },
         ...BadRequestErrorSchema,
         ...NotFoundErrorSchema,
         ...ConflictErrorSchema,
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
            return notFoundError(c, 'No domain was found with that ID');
         }

         // Try and get a primary gender with the same name in the same domain
         const existingGender = await prisma.primaryGenders.findFirst({
            where: {
               name: body.name,
               domainId: body.domainId
            }
         });

         // Check if a gender already exists
         if (existingGender) {
            return existingResourceError(
               c,
               'A primary gender with that name already exists in this domain'
            );
         }

         // Validate IP mask for gender size
         if (!checkIpMaskForSize(body.nodeIpMask, body.nodeCount)) {
            return customError(
               c,
               {
                  error: 'INVALID_IP_MASK',
                  message: 'The IP mask is not compatible with the node count'
               },
               400
            );
         }

         // Validate nam mask for gender size
         if (!checkNameMaskForSize(body.nodeNameMask, body.nodeCount)) {
            return customError(
               c,
               {
                  error: 'INVALID_NAME_MASK',
                  message: 'The name mask is not compatible with the node count'
               },
               400
            );
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

         return c.json(
            {
               id: newGender.id,
               domainId: newGender.domainId,
               name: newGender.name,
               genderIndex: newGender.genderIndex
            },
            201
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
