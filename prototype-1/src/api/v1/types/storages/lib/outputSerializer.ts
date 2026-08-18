import { Prisma } from '@prisma/client';
import { storageTypeSerializerArgs } from './includeSerializer';

export function serializeStorageType(
   storageType: Prisma.StorageTypesGetPayload<typeof storageTypeSerializerArgs>
) {
   return {
      id: storageType.id,
      name: storageType.name,
      fields: storageType.StorageTypeFields.map((field) => ({
         id: field.id,
         name: field.name,
         type: field.type,
         fixed: field.fixed
      }))
   };
}
