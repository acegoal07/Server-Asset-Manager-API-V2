import { Prisma } from '@prisma/client';
import { assetSerializerArgs } from './includeSerializers';

export function serializeAsset(asset: Prisma.AssetsGetPayload<typeof assetSerializerArgs>) {
   return {
      id: asset.id,
      name: asset.name,
      notes: asset.notes,
      uSize: asset.uSize,
      uTop: asset.uTop,
      uBottom: asset.uBottom,
      assetTypeId: asset.assetTypeId,

      data: asset.AssetData.map((data) => ({
         id: data.id,
         fieldId: data.fieldId,
         value: data.value,
         assetTypeId: data.AssetTypeFields.assetTypeId,
         name: data.AssetTypeFields.name,
         type: data.AssetTypeFields.type
      }))
   };
}
