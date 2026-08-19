import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import { InternalServerErrorSchema, NotFoundErrorSchema } from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: "Retrieves a domain using it's ID",
      tags: ['Genders'],
      request: {
         params: z.object({
            id: z.coerce
               .number({ error: 'ID must be a number' })
               .int({ error: 'ID must be an integer' })
               .positive({
                  error: 'ID must be greater than 0'
               })
         })
      },
      responses: {
         200: {
            description: 'Retrieved domain',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
                     name: z.string(),
                     dataId: z.number(),
                     dataFields: z.array(
                        z.object({
                           id: z.number(),
                           identifier: z.string(),
                           name: z.string(),
                           type: z.string(),
                           value: z.string().nullable(),
                           deletable: z.boolean()
                        })
                     )
                  })
               }
            }
         },
         ...NotFoundErrorSchema,
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
      try {
         // Get request information
         const { id } = c.req.valid('param');

         // Try and get domain from the database
         const domain = await prisma.domains.findUnique({
            where: {
               id
            },
            include: {
               Data: {
                  include: {
                     DataFields: true
                  }
               }
            }
         });

         // Check if the domain exists
         if (!domain) {
            return notFoundError(c, `Domain with id: ${id} could not be found.`);
         }

         return c.json(
            {
               id: domain.id,
               name: domain.name,
               dataId: domain.dataId,
               dataFields: domain.Data.DataFields.map((field) => ({
                  id: field.id,
                  identifier: field.identifier,
                  name: field.name,
                  type: field.type,
                  value: field.value,
                  deletable: field.deletable
               }))
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
