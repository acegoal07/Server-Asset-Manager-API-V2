import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError } from '../../../../../lib/errorMessages';
import { InternalServerErrorSchema, NotFoundErrorSchema } from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: 'Retrieves all Domains',
      tags: ['Domains'],
      responses: {
         200: {
            description: 'Retrieved all domain',
            content: {
               'application/json': {
                  schema: z.array(
                     z.object({
                        id: z.number(),
                        name: z.string(),
                        dataId: z.number()
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
         // Try and get domain from the database
         const domains = await prisma.domains.findMany();

         return c.json(
            domains.map((domain) => ({
               id: domain.id,
               name: domain.name,
               dataId: domain.dataId
            })),
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
