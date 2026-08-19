import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError } from '../../../../../lib/errorMessages';
import { InternalServerErrorSchema, NotFoundErrorSchema } from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/',
      description: 'Retrieves all primary genders',
      tags: ['Primary Genders'],
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
         // Get all the primary genders from the database
         const genders = await prisma.primaryGenders.findMany();

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
