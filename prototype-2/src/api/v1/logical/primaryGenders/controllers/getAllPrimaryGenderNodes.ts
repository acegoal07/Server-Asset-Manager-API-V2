import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import {
   DataFieldsReturnSchema,
   handleDataFieldsMerge
} from '../../../../../lib/dataFieldHelpers';
import { getNodeNameFromMask } from '../../../../../lib/nameMask';
import { getIpFromMask } from '../../../../../lib/ipMask';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: 'Retrieves a primary gender nodes',
      tags: ['Primary Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
         })
      },
      responses: {
         200: {
            description: 'Retrieved all nodes',
            content: {
               'application/json': {
                  schema: z.array(
                     z.object({
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
                  )
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

         // Get all available nodes from assets
         const assetNodes = await prisma.nodes.findMany({
            where: {
               primaryGenderId: id
            },
            include: {
               Data: {
                  include: {
                     DataFields: true
                  }
               }
            },
            orderBy: {
               nodeIndex: 'asc'
            }
         });

         // Convert the gathered nodes into a map
         const nodesByIndex = new Map(
            assetNodes.map(node => [node.nodeIndex, node])
         );

         // Fill in the blank nodes
         const filledNodes = Array.from({ length: gender.nodeCount }, (_, index) => {
            return nodesByIndex.get(index) ?? {
               name: getNodeNameFromMask(gender.nameMask, index + 1),
               nodeIndex: index,
               dataFields: [
                  {
                     name: "IP Address",
                     identifier: 'ip-address',
                     type: 'string',
                     value: getIpFromMask(gender.ipMask, index + 1),
                     deletable: false
                  }
               ]
            };
         });

         return c.json(
            filledNodes.map((node) => ({
               id: node.id ?? null,
               name: node.name,
               nodeIndex: node.nodeIndex,
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
                  node: node.dataFields
               }).map((field) => ({
                  id: field.id,
                  identifier: field.identifier,
                  name: field.name,
                  type: field.type,
                  value: field.value,
                  deletable: field.deletable
               }))
            })),
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
