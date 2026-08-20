import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   ConflictErrorSchema,
   CreateDataFieldSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import {
   customError,
   existingResourceError,
   internalServerError,
   notFoundError
} from '../../../../../lib/errorMessages';
import { checkNameMaskForSize } from '../../../../../lib/nameMask';
import { checkIpMaskForSize } from '../../../../../lib/ipMask';

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
                     nodeIpMask: z
                        .string({ error: 'IP mask must be a string' })
                        .trim()
                        .min(1, { error: 'IP mask cannot be empty' }),
                     nodeNameMask: z
                        .string({ error: 'Node name mask must be a string' })
                        .trim()
                        .min(1, { error: 'Node name mask cannot be empty' }),
                     nodeCount: z
                        .number({ error: 'Node count must be a number' })
                        .int({ error: 'Node count must be an integer' })
                        .positive({ error: 'Node count must be greater than 0' }),
                     subGenders: z
                        .array(
                           z
                              .number({ error: 'Sub gender ID must be a number' })
                              .int({ error: 'Sub gender ID must be an integer' })
                              .positive({ error: 'Sub gender ID must be greater than 0' })
                        )
                        .default([]),
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
         ...NotFoundErrorSchema,
         ...ConflictErrorSchema,
         ...InternalServerErrorSchema,
         ...BadRequestErrorSchema
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

         // Validate name mask for gender size
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

         // Try and get sub gender from the database
         const subGenders = await prisma.subGenders.findMany({
            where: {
               id: {
                  in: body.subGenders
               }
            },
            select: {
               id: true
            }
         });

         // Check sub genders exists
         if (subGenders.length !== body.subGenders.length) {
            return notFoundError(c, 'One or more sub genders were not found');
         }

         // Create the new primary gender and its nodes
         const newGender = await prisma.$transaction(async (tx) => {
            const gender = await tx.primaryGenders.create({
               data: {
                  name: body.name,
                  genderIndex: domain._count.PrimaryGenders + 1,
                  ipMask: body.nodeIpMask,
                  nameMask: body.nodeNameMask,
                  nodeCount: body.nodeCount,
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
                                 identifier: field.name.toLowerCase().replaceAll(' ', '-'),
                                 value: field.value,
                                 type: field.type
                              }))
                           }
                        }
                     }
                  }
               },
               include: {
                  Data: true
               }
            });

            for (let subIndex = 1; subIndex <= body.subGenders.length; subIndex++) {
               await tx.primaryGenders.update({
                  where: {
                     id: gender.id
                  },
                  data: {
                     GenderHierarchy: {
                        create: {
                           SubGenders: {
                              connect: {
                                 id: body.subGenders[subIndex]
                              }
                           },
                           priority: subIndex
                        }
                     }
                  }
               });
            }

            return gender;
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
