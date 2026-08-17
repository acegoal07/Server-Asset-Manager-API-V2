import { Prisma } from '@prisma/client';
import { storageSerializerArgs } from './includeSerializers';

export function serializeStorage(storage: Prisma.StoragesGetPayload<typeof storageSerializerArgs>) {
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
