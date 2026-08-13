import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { prisma } from '../../../lib/prisma';
import { assetTypeSerializerArgs, serializeAssetType } from '../lib/serialisers';

const updateTypeSchema = z.object({
   name: z.string().min(1).optional(),

   fields: z
      .array(
         z.object({
            id: z.number().int().positive().optional(),
            name: z.string().min(1),
            type: z.string().min(1)
         })
      )
      .optional()
});

export default new Hono().patch('/:id', zValidator('json', updateTypeSchema), async (c) => {
   const id = Number(c.req.param('id'));

   if (!Number.isInteger(id) || id <= 0) {
      return c.json(
         {
            error: 'Invalid asset type ID'
         },
         400
      );
   }

   const body = c.req.valid('json');

   const assetType = await prisma.assetTypes.findUnique({
      where: {
         id
      },
      include: {
         AssetTypeFields: true
      }
   });

   if (!assetType) {
      return c.json(
         {
            error: 'Asset type not found'
         },
         404
      );
   }

   /*
    * Validate duplicate field names.
    */
   if (body.fields) {
      const names = body.fields.map((field) => field.name);
      const uniqueNames = new Set(names);

      if (names.length !== uniqueNames.size) {
         return c.json(
            {
               error: 'Duplicate field names are not allowed'
            },
            400
         );
      }
   }

   const updatedAssetType = await prisma.$transaction(async (tx) => {
      await tx.assetTypes.update({
         where: {
            id
         },
         data: {
            ...(body.name !== undefined && {
               name: body.name
            })
         }
      });

      if (body.fields) {
         const incomingIds = new Set(
            body.fields.filter((field) => field.id !== undefined).map((field) => field.id!)
         );

         const fieldsToDelete = assetType.AssetTypeFields.filter(
            (field) => !incomingIds.has(field.id)
         );

         if (fieldsToDelete.length > 0) {
            await tx.assetTypeFields.deleteMany({
               where: {
                  id: {
                     in: fieldsToDelete.map((field) => field.id)
                  }
               }
            });
         }

         for (const field of body.fields) {
            if (field.id) {
               const existingField = assetType.AssetTypeFields.find(
                  (existing) => existing.id === field.id
               );

               if (!existingField) {
                  throw new Error(`Field ${field.id} does not belong to asset type ${id}`);
               }

               await tx.assetTypeFields.update({
                  where: {
                     id: field.id
                  },
                  data: {
                     name: field.name,
                     type: field.type
                  }
               });
            } else {
               await tx.assetTypeFields.create({
                  data: {
                     assetTypeId: id,
                     name: field.name,
                     type: field.type
                  }
               });
            }
         }
      }

      return tx.assetTypes.findUnique({
         where: {
            id
         },
         ...assetTypeSerializerArgs
      });
   });

   if (!updatedAssetType) {
      return c.json(
         {
            error: 'Asset type not found'
         },
         404
      );
   }

   return c.json(serializeAssetType(updatedAssetType));
});
