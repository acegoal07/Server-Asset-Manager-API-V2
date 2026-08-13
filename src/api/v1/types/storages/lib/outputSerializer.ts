import { Prisma } from '@prisma/client';
import { storageTypeSerializerArgs } from './includeSerializer';

export function serializeStorageType(
   assetType: Prisma.StorageTypesGetPayload<typeof storageTypeSerializerArgs>
) {
   return {
      id: assetType.id,
      name: assetType.name,
      fields: assetType.StorageTypeFields.map((field) => ({
         id: field.id,
         name: field.name,
         type: field.type,
         fixed: field.fixed
      }))
   };
}
