import { Prisma } from '@prisma/client';

export const storageSerializerArgs = Prisma.validator<Prisma.StoragesDefaultArgs>()({
   include: {
      StorageTypes: true,
      StorageData: {
         include: {
            StorageTypeFields: true
         }
      }
   }
});
