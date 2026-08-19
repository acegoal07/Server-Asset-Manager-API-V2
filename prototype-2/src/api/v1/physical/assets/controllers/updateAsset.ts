import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError, notFoundError } from '../../../../../lib/errorMessages';
import { assetSerializerArgs } from '../lib/includeSerializers';
import { serializeAsset } from '../lib/outputSerializers';
import {
   IdParamSchema,
   InternalServerErrorSchema,
   NotFoundErrorSchema
} from '../../../../../lib/openApiSchemas';
import { AssetReturnSchema } from '../lib/schemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'patch',
      path: '/',
      description: 'Updates an asset',
      tags: ['Assets'],
      request: {
         params: z.object({
            ...IdParamSchema
         }),
         body: {
            content: {
               'application/json': {
                  schema: z.object({
                     name: z
                        .string({ error: 'Name must be a string' })
                        .min(1, { error: 'Name cannot be empty' })
                        .optional(),

                     notes: z.string({ error: 'Notes must be a string' }).nullable().optional(),

                     uSize: z
                        .number({ error: 'uSize must be a number' })
                        .int({ error: 'uSize must be an integer' })
                        .optional(),

                     uTop: z
                        .number({ error: 'uTop must be a number' })
                        .int({ error: 'uTop must be an integer' })
                        .optional(),

                     uBottom: z
                        .number({ error: 'uBottom must be a number' })
                        .int({ error: 'uBottom must be an integer' })
                        .optional()
                  })
               }
            }
         }
      },
      responses: {
         200: {
            description: 'Asset updated',
            content: {
               'application/json': {
                  schema: AssetReturnSchema
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
         const body = c.req.valid('json');

         // Try and get the asset from the database
         const existingAsset = await prisma.assets.findUnique({
            where: { id },
            select: { id: true }
         });

         // Check that the asset exists
         if (!existingAsset) {
            return notFoundError(c, `Asset with id: ${id} could not be found.`);
         }

         // Update the asset
         const asset = await prisma.assets.update({
            where: { id },
            data: {
               ...(body.name !== undefined && { name: body.name }),
               ...(body.notes !== undefined && { notes: body.notes }),
               ...(body.uSize !== undefined && { uSize: body.uSize }),
               ...(body.uTop !== undefined && { uTop: body.uTop }),
               ...(body.uBottom !== undefined && { uBottom: body.uBottom })
            },
            ...assetSerializerArgs
         });

         return c.json(serializeAsset(asset), 200);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
