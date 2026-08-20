import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { DataFieldSchema, updateDataFields } from '../../../../../lib/dataFieldHelpers';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'patch',
      path: '/',
      description: "Update node using it's ID",
      tags: ['Nodes'],
      request: {
         params: z.object({
            ...IdParamSchema
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
                     id: z.number(),
                     dataId: z.number(),
                     primaryGenderId: z.number(),
                     nodeIndex: z.number(),
                     name: z.string()
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
         const body = c.req.valid('json');

         // Try and get the node from the database
         const node = await prisma.nodes.findUnique({
            where: {
               id
            }
         });

         // Check if the node exists
         if (!node) {
            return notFoundError(c, `Node with id: ${id} could not be found.`);
         }

         // Update the node gender
         await prisma.$transaction(async (tx) => {
            await updateDataFields(tx, node.dataId, body.dataFields);
         });

         return c.json(
            {
               id: node.id,
               dataId: node.dataId,
               primaryGenderId: node.primaryGenderId,
               nodeIndex: node.nodeIndex,
               name: node.name
            },
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
