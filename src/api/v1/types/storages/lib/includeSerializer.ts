import { Prisma } from '@prisma/client';

export const storageTypeSerializerArgs = Prisma.validator<Prisma.StorageTypesDefaultArgs>()({
   include: {
      StorageTypeFields: true
   }
});
