import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   IdSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      description: 'Adds a sub gender to a primary gender',
      tags: ['Genders'],
      request: {
         params: z.object({
            ...IdSchema
         }),
         body: {
            content: {
               'application/json': {
                  schema: z.object({
                     subGenderID: z
                        .number({ error: 'Sub gender ID must be a number' })
                        .int({ error: 'Sub gender ID must be an integer' })
                        .positive({ error: 'Sub gender ID must be greater than 0' })
                  })
               }
            }
         }
      },
      responses: {
         200: {
            description: 'Successfully linked sub gender to gender'
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
         const subGender = await prisma.subGenders.findUnique({
            where: {
               id: body.subGenderID
            },
            select: {
               id: true
            }
         });

         // Check sub gender exists
         if (!subGender) {
            return notFoundError(c, 'No sub gender was found with that ID');
         }

         // Update gender to be linked to the sub gender
         const updatedGender = await prisma.primaryGenders.update({
            where: {
               id
            },
            data: {
               GenderHierarchy: {
                  create: {
                     SubGenders: {
                        connect: {
                           id: body.subGenderID
                        }
                     },
                     priority: gender._count.GenderHierarchy + 1
                  }
               }
            }
         });

         return c.json(updatedGender);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
