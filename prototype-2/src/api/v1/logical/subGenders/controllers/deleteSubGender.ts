import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import {
   IdSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'delete',
      path: '/',
      description: 'Deletes a sub gender',
      tags: ['Sub Genders'],
      request: {
         params: z.object({
            ...IdSchema
         })
      },
      responses: {
         204: {
            description: 'Sub gender deleted'
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
            select: {
               id: true
            }
         });

         // Check if the sub gender exists
         if (!gender) {
            return notFoundError(c, `Sub gender with id: ${id} could not be found.`);
         }

         // Delete the sub gender from the database
         await prisma.subGenders.delete({
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
