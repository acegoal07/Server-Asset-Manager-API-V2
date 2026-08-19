import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { DataFieldSchema, updateDataFields } from '../../../../../lib/dataFieldHelpers';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'patch',
      path: '/',
      description: 'Updates the primary gender',
      tags: ['Primary Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
         }),
         body: {
            content: {
               'application/json': {
                  schema: z.object({
                     name: z
                        .string({ error: 'Name must be string' })
                        .trim()
                        .min(1, { error: 'Name cannot be empty' })
                        .optional(),
                     dataFields: z.array(DataFieldSchema).default([])
                  })
               }
            }
         }
      },
      responses: {
         200: {
            description: 'Primary gender successfully updated',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
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
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Try and get primary gender from the database
         const existingGender = await prisma.primaryGenders.findUnique({
            where: {
               id
            },
            select: {
               id: true
            }
         });

         // Check if the domain exists
         if (!existingGender) {
            return notFoundError(c, 'No primary gender with that ID was found');
         }

         // Update the primary gender
         const updatedGender = await prisma.$transaction(async (tx) => {
            const gender = await tx.domains.update({
               where: {
                  id
               },
               data: {
                  ...(body.name !== undefined && {
                     name: body.name
                  })
               }
            });

            await updateDataFields(tx, gender.dataId, body.dataFields);

            return gender;
         });

         return c.json(
            {
               id: updatedGender.id,
               dataId: updatedGender.dataId,
               name: updatedGender.name
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
