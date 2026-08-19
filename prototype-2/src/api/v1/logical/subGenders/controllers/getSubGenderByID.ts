import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import { InternalServerErrorSchema, NotFoundErrorSchema } from '../../../../../lib/openApiSchemas';
import { DataFieldsReturnSchema } from '../../../../../lib/dataFieldHelpers';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: "Retrieves a sub gender using it's ID",
      tags: ['Sub Genders'],
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
            description: 'Retrieved sub gender',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
                     domainId: z.number(),
                     name: z.string(),
                     dataId: z.number(),
                     dataFields: z.array(DataFieldsReturnSchema)
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

         // Try and get sub gender from the database
         const gender = await prisma.subGenders.findUnique({
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

         // Check if the sub gender exists
         if (!gender) {
            return notFoundError(c, `Sub gender with id: ${id} could not be found.`);
         }

         return c.json(
            {
               id: gender.id,
               domainId: gender.domainId,
               name: gender.name,
               dataId: gender.dataId,
               dataFields: gender.Data.DataFields.map((field) => ({
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
