import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { assetSerializerArgs, serializeAsset } from '../lib/serialisers';
import { assetValidator } from '../lib/validators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';

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

export default new Hono().post('/', assetValidator, async (c) => {
   try {
   const body = c.req.valid('json');

   const assetType = await prisma.assetTypes.findUnique({
      where: {
         id: body.assetTypeId
      },
      include: {
         AssetTypeFields: true
      }
   });

   if (!assetType) {
      return notFoundError(c, `Asset type with id: ${body.assetTypeId} could not be found.`);
   }
   const fieldsByName = new Map(assetType.AssetTypeFields.map((field) => [field.name, field]));

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

   const asset = await prisma.assets.create({
      data: {
         name: body.name,
         notes: body.notes,
         uSize: body.uSize,
         uTop: body.uTop,
         uBottom: body.uBottom,
         assetTypeId: body.assetTypeId,

         AssetData: {
            create: Object.entries(body.data).map(([name, value]) => {
               const field = fieldsByName.get(name)!;

               return {
                  fieldId: field.id,
                  value
               };
            })
         }
      },

      ...assetSerializerArgs
   });

   return c.json(serializeAsset(asset), 201);
} catch (err) {
   return internalServerError(c, err)
}
});
