import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import {
   dataFields,
   DataFieldsReturnSchema,
   handleDataFieldsMerge
} from '../../../../../lib/dataFieldHelpers';
import { findNodeIndex } from '../../../../../lib/nameMask';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: "Retrieves a node based on it's name",
      tags: ['Primary Genders', 'Nodes'],
      request: {
         params: z.object({
            ...IdParamSchema,
            name: z.string()
         })
      },
      responses: {
         200: {
            description: 'Retrieved node',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number().optional(),
                     nodeIndex: z.number(),
                     name: z.string(),
                     genderId: z.number(),
                     gender: z.string(),
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
         const { id, name } = c.req.valid('param');

         // Get the primary gender and all inherited data
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

         let node = await prisma.nodes.findFirst({
            where: {
               primaryGenderId: gender.id,
               name
            },
            include: {
               Data: {
                  include: {
                     DataFields: true
                  }
               }
            }
         });

         let nodeId: number | undefined;
         let nodeDataFields: dataFields[] = [];
         let index: number;

         if (node) {
            nodeId = node.id;
            nodeDataFields = node.Data.DataFields;
            index = node.nodeIndex;
         } else {
            index = findNodeIndex(gender.nameMask, name, gender.nodeCount);

            if (index === 0) {
               return notFoundError(c, `Node with name: ${name} could not be found.`);
            }

            node = await prisma.nodes.findFirst({
               where: {
                  primaryGenderId: gender.id,
                  nodeIndex: index
               },
               include: {
                  Data: {
                     include: {
                        DataFields: true
                     }
                  }
               }
            });

            if (node) {
               return notFoundError(c, `Node with name: ${name} could not be found.`);
            }
         }

         return c.json(
            {
               id: nodeId,
               name,
               nodeIndex: index,
               genderId: gender.id,
               gender: gender.name,
               subGenders: gender.GenderHierarchy.map((sub) => ({
                  id: sub.SubGenders.id,
                  name: sub.SubGenders.name,
                  priority: sub.priority
               })),
               dataFields: handleDataFieldsMerge({
                  domain: gender.Domains.Data.DataFields,
                  primaryGender: gender.Data.DataFields,
                  subGenders: gender.GenderHierarchy.flatMap(
                     (sub) => sub.SubGenders.Data.DataFields
                  ),
                  node: nodeDataFields
               }).map((field) => ({
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
