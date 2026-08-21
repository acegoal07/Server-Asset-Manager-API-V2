import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   DataFieldsReturnSchema,
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import {
   checkDataFieldForETA,
   checkNodeDataFieldsForIP,
   handleDataFieldsMerge
} from '../../../../../lib/dataFieldHelpers';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: "Retrieves a node using it's ID",
      tags: ['Nodes'],
      request: {
         params: z.object({
            ...IdParamSchema
         })
      },
      responses: {
         200: {
            description: 'Retrieved node',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
                     primaryGenderId: z.number(),
                     dataId: z.number(),
                     name: z.string(),
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

         // Try and get node from the database
         const node = await prisma.nodes.findUnique({
            where: {
               id
            },
            include: {
               Data: {
                  include: {
                     DataFields: true
                  }
               },
               PrimaryGenders: {
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
               }
            }
         });

         // Check if the node exists
         if (!node) {
            return notFoundError(c, `Node with id: ${id} could not be found.`);
         }

         // Converted node
         const convertedNode = {
            ...node,
            Data: {
               ...node.Data,
               DataFields: Object.fromEntries(
                  handleDataFieldsMerge({
                     domain: node.PrimaryGenders.Domains.Data.DataFields,
                     primaryGender: node.PrimaryGenders.Data.DataFields,
                     subGenders: node.PrimaryGenders.GenderHierarchy.flatMap(
                        (sub) => sub.SubGenders.Data.DataFields
                     ),
                     node: checkNodeDataFieldsForIP(
                        node.Data.DataFields,
                        node.nodeIndex,
                        node.PrimaryGenders.ipMask
                     )
                  }).map((field) => [field.identifier, field])
               )
            }
         };

         return c.json(
            {
               id: node.id,
               primaryGenderId: node.primaryGenderId,
               dataId: node.dataId,
               name: node.name,
               subGenders: node.PrimaryGenders.GenderHierarchy.map((sub) => ({
                  id: sub.SubGenders.id,
                  name: sub.SubGenders.name,
                  priority: sub.priority
               })),
               dataFields: checkDataFieldForETA(convertedNode.Data.DataFields, convertedNode)
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
