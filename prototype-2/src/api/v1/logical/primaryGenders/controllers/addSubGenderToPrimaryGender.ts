import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      description: 'Adds a sub gender to a primary gender',
      tags: ['Primary Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
         }),
         body: {
            content: {
               'application/json': {
                  schema: z
                     .array(
                        z
                           .number({ error: 'Sub gender ID must be a number' })
                           .int({ error: 'Sub gender ID must be an integer' })
                           .positive({ error: 'Sub gender ID must be greater than 0' })
                     )
                     .min(1, { error: 'At least one sub gender ID is required' })
                     .refine((ids) => new Set(ids).size === ids.length, {
                        error: 'Sub gender IDs must be unique'
                     })
               }
            }
         }
      },
      responses: {
         200: {
            description: 'Successfully linked sub gender to gender',
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
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
      try {
         // Get request information
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Try and get the primary gender from the database
         const gender = await prisma.primaryGenders.findUnique({
            where: {
               id
            },
            include: {
               _count: {
                  select: {
                     GenderHierarchy: true
                  }
               }
            }
         });

         // Check gender exists
         if (!gender) {
            return notFoundError(c, 'No primary gender was found with that ID');
         }

         // Try and get sub gender from the database
         const subGenders = await prisma.subGenders.findMany({
            where: {
               id: {
                  in: body
               }
            },
            select: {
               id: true
            }
         });

         // Check sub genders exists
         if (subGenders.length !== body.length) {
            return notFoundError(c, 'One or more sub genders were not found');
         }

         // Update gender to be linked to the sub gender
         const startingPriority = gender._count.GenderHierarchy + 1;
         const updatedGender = await prisma.$transaction(async (tx) => {
            for (const [index, subGenderId] of body.entries()) {
               await tx.primaryGenders.update({
                  where: {
                     id
                  },
                  data: {
                     GenderHierarchy: {
                        create: {
                           SubGenders: {
                              connect: {
                                 id: subGenderId
                              }
                           },
                           priority: startingPriority + index
                        }
                     }
                  }
               });
            }

            return tx.primaryGenders.findUnique({
               where: {
                  id
               }
            });
         });

         // Make sure a updated gender is returned
         if (!updatedGender) {
            return notFoundError(c, 'Failed to retrieve gender after updating');
         }

         return c.json(
            {
               id: updatedGender.id,
               domainId: updatedGender.domainId,
               name: updatedGender.name,
               genderIndex: updatedGender.genderIndex
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
