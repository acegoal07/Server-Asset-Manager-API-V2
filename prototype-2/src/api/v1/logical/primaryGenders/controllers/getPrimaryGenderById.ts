import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { deepMergeByName } from '../../../../../lib/deepMerge';
import { DataFieldsReturnSchema } from '../../../../../lib/dataFieldHelpers';

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

         // Check if the sub gender exists
         if (!gender) {
            return notFoundError(c, `Sub gender with id: ${id} could not be found.`);
         }

         // Data fields array
         const DataFieldsArray = [];
         DataFieldsArray.unshift(gender.Domains.Data.DataFields);
         DataFieldsArray.unshift(gender.Data.DataFields);
         gender.GenderHierarchy.sort((a, b) => b.priority - a.priority).forEach((sub) =>
            DataFieldsArray.unshift(sub.SubGenders.Data.DataFields)
         );

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
               dataFields: deepMergeByName(DataFieldsArray).map((field) => ({
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
