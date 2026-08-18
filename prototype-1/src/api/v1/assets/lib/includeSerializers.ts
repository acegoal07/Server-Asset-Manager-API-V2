import { Prisma } from '@prisma/client';

export const assetSerializerArgs = Prisma.validator<Prisma.AssetsDefaultArgs>()({
   include: {
      AssetTypes: true,
      AssetData: {
         include: {
            AssetTypeFields: true
         }
      }
   }
});
