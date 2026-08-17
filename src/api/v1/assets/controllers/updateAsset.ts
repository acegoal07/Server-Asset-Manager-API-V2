import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { assetSerializerArgs, serializeAsset } from '../lib/serialisers';
import { updateAssetValidator } from '../lib/validators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { requestIdValidator } from '../../../../lib/requestValidators';

const validateFieldValue = (type: string | null, value: string): boolean => {
   switch (type) {
      case 'string':
         return true;

      case 'number':
         return !Number.isNaN(Number(value));

      case 'boolean':
         return value === 'true' || value === 'false';

      case 'date':
         return !Number.isNaN(Date.parse(value));

      default:
         return false;
   }
};

export default new Hono().patch('/:id', updateAssetValidator, requestIdValidator({}), async (c) => {
   try {
      const { id } = c.req.valid('param');

      const body = c.req.valid('json');

      const asset = await prisma.assets.findUnique({
         where: {
            id
         },
         include: {
            AssetTypes: {
               include: {
                  AssetTypeFields: true
               }
            }
         }
      });

      if (!asset) {
         return notFoundError(c, `Asset with id: ${id} could not be found.`);
      }

      // validate body
      if (body.data) {
         const fieldsByName = new Map(
            asset.AssetTypes?.AssetTypeFields.map((field) => [field.name, field])
         );

         const errors: Record<string, string> = {};

         for (const [name, value] of Object.entries(body.data)) {
            const field = fieldsByName.get(name);

            if (!field) {
               errors[name] = 'Field does not exist on this asset type';

               continue;
            }

            if (!validateFieldValue(field.type, value)) {
               errors[name] = `Value does not match field type "${field.type}"`;
            }
         }

         if (Object.keys(errors).length > 0) {
            return c.json(
               {
                  error: 'Invalid asset data',
                  fields: errors
               },
               400
            );
         }
      }

      const updatedAsset = await prisma.$transaction(async (tx) => {
         // update asset fields
         await tx.assets.update({
            where: {
               id
            },

            data: {
               ...(body.name !== undefined && {
                  name: body.name
               }),

               ...(body.notes !== undefined && {
                  notes: body.notes
               }),

               ...(body.uSize !== undefined && {
                  position: body.uSize
               }),

               ...(body.uTop !== undefined && {
                  position: body.uTop
               }),

               ...(body.uBottom !== undefined && {
                  position: body.uBottom
               })
            }
         });

         // update asset
         if (body.data) {
            const fieldsByName = new Map(
               asset.AssetTypes?.AssetTypeFields.map((field) => [field.name, field])
            );

            for (const [name, value] of Object.entries(body.data)) {
               const field = fieldsByName.get(name)!;

               await tx.assetData.upsert({
                  where: {
                     assetId_fieldId: {
                        assetId: id,
                        fieldId: field.id
                     }
                  },

                  create: {
                     assetId: id,
                     fieldId: field.id,
                     value
                  },

                  update: {
                     value
                  }
               });
            }
         }

         // return asset
         return tx.assets.findUnique({
            where: {
               id
            },
            ...assetSerializerArgs
         });
      });

      if (!updatedAsset) {
         return c.json(
            {
               error: 'Asset not found'
            },
            404
         );
      }

      return c.json(serializeAsset(updatedAsset));
   } catch (err) {
      return internalServerError(c, err);
   }
});
