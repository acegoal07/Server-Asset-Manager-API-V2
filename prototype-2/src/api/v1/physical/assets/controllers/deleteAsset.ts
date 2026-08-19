import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import { InternalServerErrorSchema, NotFoundErrorSchema } from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'delete',
      path: '/{id}',
      description: 'Deletes an asset',
      tags: ['Assets'],
      request: {
         params: z.object({
            id: z.coerce.number().int().positive()
         })
      },
      responses: {
         204: {
            description: 'Asset deleted'
         },
         ...NotFoundErrorSchema,
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
      try {
         // Get request information
         const { id } = c.req.valid('param');

         // Try and get asset from the database
         const asset = await prisma.assets.findUnique({
            where: {
               id
            }
         });

         // Check if the asset exists
         if (!asset) {
            return notFoundError(c, `Asset with id: ${id} could not be found.`);
         }

         // Delete the asset from the database
         await prisma.assets.delete({
            where: {
               id
            }
         });

         return c.body(null, 204);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
