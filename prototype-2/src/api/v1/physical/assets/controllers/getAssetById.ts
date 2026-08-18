import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import { assetSerializerArgs } from '../lib/includeSerializers';
import { serializeAsset } from '../lib/outputSerializers';

const assetResponseSchema = z.object({
   id: z.number(),
   name: z.string(),
   notes: z.string().nullable(),
   uSize: z.number(),
   uTop: z.number(),
   uBottom: z.number()
});

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'get',
      path: '/{id}',
      tags: ['v1-Assets'],

      request: {
         params: z.object({
            id: z.coerce.number().int().positive()
         })
      },

      responses: {
         200: {
            description: 'Asset retrieved',
            content: {
               'application/json': {
                  schema: assetResponseSchema
               }
            }
         },

         404: {
            description: 'Asset not found',
            content: {
               'application/json': {
                  schema: z.object({
                     error: z.string(),
                     message: z.string()
                  })
               }
            }
         },

         500: {
            description: 'Internal server error',
            content: {
               'application/json': {
                  schema: z.object({
                     error: z.string(),
                     message: z.string().optional(),
                     details: z.unknown().optional()
                  })
               }
            }
         }
      }
   }),
   async (c) => {
      try {
         const { id } = c.req.valid('param');

         const asset = await prisma.assets.findUnique({
            where: {
               id
            },
            ...assetSerializerArgs
         });

         if (!asset) {
            return notFoundError(c, `Asset with id: ${id} could not be found.`);
         }

         return c.json(serializeAsset(asset), 200);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
