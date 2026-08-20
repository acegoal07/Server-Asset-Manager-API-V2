import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'delete',
      path: '/',
      description: "Deletes information about a node based on it's name",
      tags: ['Primary Genders', 'Nodes'],
      request: {
         params: z.object({
            ...IdParamSchema,
            name: z.string()
         })
      },
      responses: {
         204: {
            description: 'deleted'
         },
         ...NotFoundErrorSchema,
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
      try {
         const { id, name } = c.req.valid('param');

         const gender = await prisma.primaryGenders.findUnique({
            where: {
               id
            }
         });

         if (!gender) {
            return notFoundError(c, `Primary gender with id: ${id} could not be found.`);
         }

         const node = await prisma.nodes.findFirst({
            where: {
               primaryGenderId: gender.id,
               name
            }
         });

         if (!node) {
            return notFoundError(c, `Node with name: ${name} could not be found.`);
         }

         await prisma.nodes.delete({
            where: {
               id: node.id
            }
         });

         return c.body(null, 204);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
