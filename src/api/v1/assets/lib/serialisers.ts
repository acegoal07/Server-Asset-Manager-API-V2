import { Prisma } from '@prisma/client';

const assetSerializerArgs = Prisma.validator<Prisma.AssetsDefaultArgs>()({
   include: {
      AssetTypes: true,
      AssetData: {
         include: {
            AssetTypeFields: true
         }
      }
   }
});

type AssetForSerialization = Prisma.AssetsGetPayload<typeof assetSerializerArgs>;

function serializeAsset(asset: AssetForSerialization) {
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

export { AssetForSerialization, serializeAsset, assetSerializerArgs };
