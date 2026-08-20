import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   BadRequestErrorSchema,
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { DataFieldSchema, updateDataFields } from '../../../../../lib/dataFieldHelpers';
import { findNodeIndex } from '../../../../../lib/nameMask';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'patch',
      path: '/',
      description: 'Updates a node based on its name',
      tags: ['Primary Genders', 'Nodes'],

      request: {
         params: z.object({
            ...IdParamSchema,
            name: z.string()
         }),
         body: {
            content: {
               'application/json': {
                  schema: z.object({
                     dataFields: z.array(DataFieldSchema).default([])
                  })
               }
            }
         }
      },

      responses: {
         200: {
            description: 'Node successfully updated',
            content: {
               'application/json': {
                  schema: z.object({
                     nodeId: z.number(),
                     name: z.string(),
                     index: z.number()
                  })
               }
            }
         },
         ...NotFoundErrorSchema,
         ...InternalServerErrorSchema,
         ...BadRequestErrorSchema
      }
   }),

   async (c) => {
      try {
         const { id, name } = c.req.valid('param');
         const body = c.req.valid('json');

         // Get the primary gender
         const gender = await prisma.primaryGenders.findUnique({
            where: {
               id
            }
         });

         if (!gender) {
            return notFoundError(c, `Primary gender with id: ${id} could not be found.`);
         }

         const node = await prisma.$transaction(async (tx) => {
            // First try to find a persisted node by name.

            let existingNode = await tx.nodes.findFirst({
               where: {
                  primaryGenderId: gender.id,
                  name
               }
            });

            if (existingNode) {
               // The node already exists, so update its data.
               await updateDataFields(tx, existingNode.dataId, body.dataFields);

               return existingNode;
            }
            const nodeIndex = findNodeIndex(gender.nameMask, name, gender.nodeCount);

            if (nodeIndex === 0) {
               throw new Error(`Node with name: ${name} could not be found.`);
            }

            existingNode = await tx.nodes.findFirst({
               where: {
                  primaryGenderId: gender.id,
                  nodeIndex
               }
            });

            if (existingNode) {
               throw new Error(`Node with name: ${name} could not be found.`);
            }

            const data = await tx.data.create({
               data: {}
            });

            existingNode = await tx.nodes.create({
               data: {
                  primaryGenderId: gender.id,
                  name,
                  dataId: data.id,
                  nodeIndex
               }
            });

            await updateDataFields(tx, existingNode.dataId, body.dataFields);

            return existingNode;
         });

         return c.json(
            {
               nodeId: node.id,
               name: node.name!,
               index: node.nodeIndex
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
