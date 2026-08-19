import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import {
   BadRequestErrorSchema,
   ConflictErrorSchema,
   InternalServerErrorSchema
} from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'patch',
      path: '/',
      tags: ['v1-Domains'],
      request: {
         params: z.object({
            id: z.coerce.number()
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

                     dataFields: z
                        .array(
                           z.discriminatedUnion('action', [
                              z.object({
                                 action: z.literal('create'),
                                 name: z.string({ error: 'Name must be string' }).trim().min(1, {
                                    error: 'Name cannot be empty'
                                 }),
                                 identifier: z
                                    .string({
                                       error: 'Identifier must be string'
                                    })
                                    .trim()
                                    .min(1, {
                                       error: 'Identifier cannot be empty'
                                    }),
                                 type: z.string({ error: 'Type must be string' }).trim().min(1, {
                                    error: 'Type cannot be empty'
                                 }),
                                 value: z
                                    .string({
                                       error: 'Value must be string'
                                    })
                                    .trim()
                                    .nullable()
                              }),

                              z.object({
                                 action: z.literal('update'),
                                 identifier: z
                                    .string({
                                       error: 'Identifier must be string'
                                    })
                                    .trim()
                                    .min(1, {
                                       error: 'Identifier cannot be empty'
                                    }),
                                 type: z.string({ error: 'Type must be string' }).trim().min(1, {
                                    error: 'Type cannot be empty'
                                 }),
                                 value: z
                                    .string({
                                       error: 'Value must be string'
                                    })
                                    .trim()
                                    .nullable()
                              }),

                              z.object({
                                 action: z.literal('delete'),
                                 identifier: z
                                    .string({
                                       error: 'Identifier must be string'
                                    })
                                    .trim()
                                    .min(1, {
                                       error: 'Identifier cannot be empty'
                                    })
                              })
                           ])
                        )
                        .default([])
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
      const { id } = c.req.valid('param');
      const body = c.req.valid('json');

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
               name: true
            }
         });

         const fieldsToCreate = body.dataFields.filter((field) => field.action === 'create');

         const fieldsToUpdate = body.dataFields.filter((field) => field.action === 'update');

         const fieldsToDelete = body.dataFields.filter((field) => field.action === 'delete');

         if (fieldsToCreate.length > 0) {
            await tx.dataFields.createMany({
               data: fieldsToCreate.map((field) => ({
                  dataId: id,
                  name: field.name,
                  identifier: field.identifier,
                  type: field.type,
                  value: field.value
               }))
            });
         }

         for (const field of fieldsToUpdate) {
            await tx.dataFields.update({
               where: {
                  dataId_identifier: {
                     dataId: id,
                     identifier: field.identifier
                  }
               },
               data: {
                  type: field.type,
                  value: field.value
               }
            });
         }

         if (fieldsToDelete.length > 0) {
            await tx.dataFields.deleteMany({
               where: {
                  dataId: id,
                  identifier: {
                     in: fieldsToDelete.map((field) => field.identifier)
                  }
               }
            });
         }

         return domain;
      });

      return c.json(updatedDomain, 200);
   }
);
