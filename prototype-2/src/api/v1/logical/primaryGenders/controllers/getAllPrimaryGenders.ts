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
      method: 'get',
      path: '/',
      description: 'Retrieves all primary genders from a domain',
      tags: ['Primary Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
         })
      },
      responses: {
         200: {
            description: 'Retrieved all primary genders',
            content: {
               'application/json': {
                  schema: z.array(
                     z.object({
                        id: z.number(),
                        domainId: z.number(),
                        dataId: z.number(),
                        name: z.string(),
                        genderIndex: z.number()
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

         // Try and get the domain
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
            return notFoundError(c, 'No domain with that ID has been found');
         }

         // Get all the primary genders from the database
         const genders = await prisma.primaryGenders.findMany({
            where: {
               domainId: id
            }
         });

         return c.json(
            genders.map((gender) => ({
               id: gender.id,
               domainId: gender.domainId,
               dataId: gender.dataId,
               name: gender.name,
               genderIndex: gender.genderIndex
            })),
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
