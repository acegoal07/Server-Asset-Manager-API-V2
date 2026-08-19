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
      description: 'Deletes a domain',
      tags: ['Domains'],
      request: {
         params: z.object({
            ...IdSchema
         })
      },
      responses: {
         204: {
            description: 'Domain deleted'
         },
         ...NotFoundErrorSchema,
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
      try {
         // Get request information
         const { id } = c.req.valid('param');

         // Try and get domain from the database
         const domain = await prisma.domains.findUnique({
            where: {
               id
            },
            select: {
               id: true
            }
         });

         // Check if the domain exists
         if (!domain) {
            return notFoundError(c, `Domain with id: ${id} could not be found.`);
         }

         // Delete the domain from the database
         await prisma.domains.delete({
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
