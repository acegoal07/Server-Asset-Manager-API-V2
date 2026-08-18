import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError } from '../../../../../lib/errorMessages';
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
      path: '/',
      tags: ['v1-Assets'],

      responses: {
         200: {
            description: 'Assets retrieved',
            content: {
               'application/json': {
                  schema: z.array(assetResponseSchema)
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
         const assets = await prisma.assets.findMany({
            ...assetSerializerArgs
         });

         return c.json(assets.map(serializeAsset), 200);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
