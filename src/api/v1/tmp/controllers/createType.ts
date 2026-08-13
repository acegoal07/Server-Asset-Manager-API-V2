import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { prisma } from '../../../lib/prisma';
import { assetTypeSerializerArgs, serializeAssetType } from '../lib/serialisers';

const createTypeSchema = z.object({
   name: z.string().min(1),
   fields: z
      .array(
         z.object({
            name: z.string().min(1),
            type: z.string().min(1)
         })
      )
      .min(1)
});

export default new Hono().post('/', zValidator('json', createTypeSchema), async (c) => {
   const body = c.req.valid('json');

   const assetType = await prisma.assetTypes.create({
      data: {
         name: body.name,
         AssetTypeFields: {
            create: body.fields.map((field) => ({
               name: field.name,
               type: field.type
            }))
         }
      },
      ...assetTypeSerializerArgs
   });

   return c.json(serializeAssetType(assetType), 201);
});
