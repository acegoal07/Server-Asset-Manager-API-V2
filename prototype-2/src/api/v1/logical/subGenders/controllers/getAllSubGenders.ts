import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError } from '../../../../../lib/errorMessages';
import {
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: 'Retrieves all sub genders from a domain',
      tags: ['Sub Genders'],
      request: {
         params: z.object({
            ...IdParamSchema
         })
      },
      responses: {
         200: {
            description: 'Retrieved all sub genders',
            content: {
               'application/json': {
                  schema: z.array(
                     z.object({
                        id: z.number(),
                        domainId: z.number(),
                        dataId: z.number(),
                        name: z.string()
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

         // Get all the sub genders from the database
         const genders = await prisma.subGenders.findMany({
            where: {
               domainId: id
            }
         });

         return c.json(
            genders.map((gender) => ({
               id: gender.id,
               domainId: gender.domainId,
               dataId: gender.dataId,
               name: gender.name
            })),
            200
         );
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
