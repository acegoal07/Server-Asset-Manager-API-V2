import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   ConflictErrorSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { DataFieldSchema, updateDataFields } from '../../../../../lib/dataFieldHelpers';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'patch',
      path: '/',
      tags: ['Domains'],
      request: {
         params: z.object({
            id: z.coerce
               .number({ error: 'ID must be a number' })
               .int({ error: 'ID must be an integer' })
               .positive({
                  error: 'ID must be greater than 0'
               })
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
            description: 'Domain successfully updated',
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
         ...ConflictErrorSchema,
         ...InternalServerErrorSchema
      }
   }),

   async (c) => {
      try {
         // Get request information
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Try and get domain from the database
         const existingDomain = await prisma.domains.findUnique({
            where: {
               id
            },
            select: {
               id: true
            }
         });

         // Check if the domain exists
         if (!existingDomain) {
            return notFoundError(c, 'No domain with that ID was found');
         }

         // Update the domain
         const updatedDomain = await prisma.$transaction(async (tx) => {
            const domain = await tx.domains.update({
               where: {
                  id
               },
               data: {
                  ...(body.name !== undefined && {
                     name: body.name
                  })
               },
               select: {
                  id: true,
                  name: true,
                  dataId: true
               }
            });

            await updateDataFields(tx, domain.dataId, body.dataFields);

            return domain;
         });

         return c.json(
            {
               id: updatedDomain.id,
               dataId: updatedDomain.dataId,
               name: updatedDomain.name
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
