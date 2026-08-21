import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   DataFieldsReturnSchema,
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { handleDataFieldsMerge } from '../../../../../lib/dataFieldHelpers';
import { checkDataFieldForETA } from '../../../../../lib/etaFieldHelper';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: "Retrieves a sub gender using it's ID",
      tags: ['Sub Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
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
                     dataFields: z.record(z.string(), DataFieldsReturnSchema)
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
               },
               Domains: {
                  include: {
                     Data: {
                        include: {
                           DataFields: true
                        }
                     }
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
               dataFields: await checkDataFieldForETA(
                  Object.fromEntries(
                     handleDataFieldsMerge({
                        domain: gender.Domains.Data.DataFields,
                        subGenders: gender.Data.DataFields
                     }).map((field) => [field.identifier, field])
                  ),
                  gender.domainId
               )
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
