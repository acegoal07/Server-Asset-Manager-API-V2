import { Prisma } from '@prisma/client';
import { assetTypeSerializerArgs } from './includeSerializer';

export function serializeAssetType(
   assetType: Prisma.AssetTypesGetPayload<typeof assetTypeSerializerArgs>
) {
   return {
      id: assetType.id,
      name: assetType.name,
      fields: assetType.AssetTypeFields.map((field) => ({
         id: field.id,
         name: field.name,
         type: field.type,
         fixed: field.fixed
      }))
   };
}
