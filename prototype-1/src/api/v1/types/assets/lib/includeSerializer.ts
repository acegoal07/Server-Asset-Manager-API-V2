import { Prisma } from '@prisma/client';

export const assetTypeSerializerArgs = Prisma.validator<Prisma.AssetTypesDefaultArgs>()({
   include: {
      AssetTypeFields: true
   }
});
