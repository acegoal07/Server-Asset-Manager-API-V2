import { Prisma } from '@prisma/client';

export const assetTypeSerializerArgs = Prisma.validator<Prisma.AssetTypesDefaultArgs>()({
   include: {
      AssetTypeFields: true
   }
});

export type AssetTypeForSerialization = Prisma.AssetTypesGetPayload<typeof assetTypeSerializerArgs>;

export function serializeAssetType(assetType: AssetTypeForSerialization) {
   return {
      id: assetType.id,
      name: assetType.name,
      fields: assetType.AssetTypeFields.map((field) => ({
         id: field.id,
         name: field.name,
         type: field.type
      }))
   };
}
