import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   DataFieldsReturnSchema,
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { checkDataFieldForETA } from '../../../../../lib/dataFieldHelpers';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: "Retrieves a domain using it's ID",
      tags: ['Domains'],
      request: {
         params: z.object({
            ...IdParamSchema
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

         // Converted domain
         const convertedDomain = {
            ...domain,
            Data: {
               ...domain.Data,
               DataFields: Object.fromEntries(
                  domain.Data.DataFields.map((field) => [field.identifier, field])
               )
            }
         };

         return c.json(
            {
               id: domain.id,
               name: domain.name,
               dataId: domain.dataId,
               dataFields: Object.fromEntries(
                  checkDataFieldForETA(domain.Data.DataFields, convertedDomain).map((field) => [
                     field.identifier,
                     {
                        id: field.id,
                        identifier: field.identifier,
                        name: field.name,
                        type: field.type,
                        value: field.value,
                        raw: field?.raw ?? undefined,
                        deletable: field.deletable
                     }
                  ])
               )
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
