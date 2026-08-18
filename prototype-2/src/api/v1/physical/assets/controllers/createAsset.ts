import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { prisma } from '../../../../../lib/prisma';
import { internalServerError } from '../../../../../lib/errorMessages';
import { assetSerializerArgs } from '../lib/includeSerializers';
import { serializeAsset } from '../lib/outputSerializers';
import { InternalServerErrorSchema } from '../../../../../lib/openApiSchemas';

export default new OpenAPIHono().openapi(
   createRoute({
      method: 'post',
      path: '/',
      tags: ['v1-Assets'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: z.object({
                     name: z
                        .string({ error: 'Name must be a string' })
                        .min(1, { error: 'Name cannot be empty' }),
                     notes: z.string({ error: 'Notes must be a string' }).nullable().optional(),
                     uSize: z
                        .number({ error: 'uSize must be a number' })
                        .int({ error: 'uSize must be an integer' })
                        .default(1),
                     uTop: z
                        .number({ error: 'uTop must be a number' })
                        .int({ error: 'uTop must be an integer' })
                        .default(0),
                     uBottom: z
                        .number({ error: 'uBottom must be a number' })
                        .int({ error: 'uBottom must be an integer' })
                        .default(0)
                  })
               }
            }
         }
      },
      responses: {
         201: {
            description: 'Asset created',
            content: {
               'application/json': {
                  schema: z.object({
                     id: z.number(),
                     name: z.string(),
                     notes: z.string().nullable(),
                     uSize: z.number(),
                     uTop: z.number(),
                     uBottom: z.number()
                  })
               }
            }
         },
         ...InternalServerErrorSchema
      }
   }),
   async (c) => {
      try {
         // Get request information
         const body = c.req.valid('json');

         // Create asset in the database
         const asset = await prisma.assets.create({
            data: {
               name: body.name,
               notes: body.notes,
               uSize: body.uSize,
               uTop: body.uTop,
               uBottom: body.uBottom
            },
            ...assetSerializerArgs
         });

         return c.json(serializeAsset(asset), 201);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
