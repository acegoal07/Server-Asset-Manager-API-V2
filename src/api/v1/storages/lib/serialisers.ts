import { Prisma } from '@prisma/client';

const storageSerializerArgs = Prisma.validator<Prisma.StoragesDefaultArgs>()({
   include: {
      StorageTypes: true,
      StorageData: {
         include: {
            StorageTypeFields: true
         }
      }
   }
});

type StorageForSerialization = Prisma.StoragesGetPayload<typeof storageSerializerArgs>;

function serializeStorage(storage: StorageForSerialization) {
   return {
      id: storage.id,
      name: storage.name,
      notes: storage.notes,
      storageTypeId: storage.storageTypeId,

      data: storage.StorageData.map((data) => ({
         id: data.id,
         fieldId: data.fieldId,
         value: data.value,
         storageTypeId: data.StorageTypeFields.storageTypeId,
         name: data.StorageTypeFields.name,
         type: data.StorageTypeFields.type
      }))
   };
}

export { StorageForSerialization, serializeStorage, storageSerializerArgs };
