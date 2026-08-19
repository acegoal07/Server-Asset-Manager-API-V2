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
      description: 'Removes sub genders from a primary gender',
      tags: ['Primary Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
         }),
         body: {
            content: {
               'application/json': {
                  schema: z.object({
                     ids: z
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
                  })
               }
            }
         }
      },
      responses: {
         200: {
            description: 'Successfully removed the sub genders from the primary gender',
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

         // Try and get the sub genders from the database
         const subGenders = await prisma.subGenders.findMany({
            where: {
               id: {
                  in: body.ids
               }
            },
            select: {
               id: true
            }
         });

         // Check sub genders exists
         if (subGenders.length !== body.ids.length) {
            return notFoundError(c, 'One or more sub genders were not found');
         }

         // Try and get the sub genders linked to the primary gender
         const linkedSubGenders = await prisma.genderHierarchy.findMany({
            where: {
               primaryGenderId: id,
               SubGenders: {
                  some: {
                     id: {
                        in: body.ids
                     }
                  }
               }
            },
            select: {
               SubGenders: {
                  select: {
                     id: true
                  }
               }
            }
         });

         // Check sub genders exists
         if (linkedSubGenders.length !== body.ids.length) {
            return notFoundError(c, 'One or more sub genders are not linked to the primary gender');
         }

         // Update gender to be linked to the sub gender
         const updatedGender = await prisma.$transaction(async (tx) => {
            await tx.genderHierarchy.deleteMany({
               where: {
                  primaryGenderId: id,
                  SubGenders: {
                     some: {
                        id: {
                           in: body.ids
                        }
                     }
                  }
               }
            });

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
