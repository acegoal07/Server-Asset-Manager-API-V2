import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import { InternalServerErrorSchema, NotFoundErrorSchema } from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'delete',
      path: '/',
      description: 'Deletes a primary gender',
      tags: ['Genders'],
      request: {
         params: z.object({
            id: z.coerce
               .number({ error: 'ID must be a number' })
               .int({ error: 'ID must be an integer' })
               .positive({
                  error: 'ID must be greater than 0'
               })
         })
      },
      responses: {
         204: {
            description: 'Primary gender deleted'
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
            select: {
               id: true
            }
         });

         // Check if the primary gender exists
         if (!gender) {
            return notFoundError(c, `Primary gender with id: ${id} could not be found.`);
         }

         // Delete the primary gender from the database
         await prisma.primaryGenders.delete({
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
