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
      description: "Retrieves a primary gender using it's ID",
      tags: ['Primary Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
         })
      },
      responses: {
         200: {
            description: 'Retrieved primary gender',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
                     domainId: z.number(),
                     name: z.string(),
                     dataId: z.number(),
                     subGenders: z.array(
                        z.object({
                           id: z.number(),
                           name: z.string(),
                           priority: z.number()
                        })
                     ),
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

         // Try and get primary gender from the database
         const gender = await prisma.primaryGenders.findUnique({
            where: {
               id
            },
            include: {
               GenderHierarchy: {
                  include: {
                     SubGenders: {
                        include: {
                           Data: {
                              include: {
                                 DataFields: true
                              }
                           }
                        }
                     }
                  },
                  orderBy: {
                     priority: 'desc'
                  }
               },
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

         // Check if the primary gender exists
         if (!gender) {
            return notFoundError(c, `Primary gender with id: ${id} could not be found.`);
         }

         return c.json(
            {
               id: gender.id,
               domainId: gender.domainId,
               name: gender.name,
               dataId: gender.dataId,
               subGenders: gender.GenderHierarchy.map((sub) => ({
                  id: sub.SubGenders.id,
                  name: sub.SubGenders.name,
                  priority: sub.priority
               })),
               dataFields: await checkDataFieldForETA(
                  Object.fromEntries(
                     handleDataFieldsMerge({
                        domain: gender.Domains.Data.DataFields,
                        primaryGender: gender.Data.DataFields,
                        subGenders: gender.GenderHierarchy.flatMap(
                           (sub) => sub.SubGenders.Data.DataFields
                        )
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
