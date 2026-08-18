import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';

/**
 * The storage type
 */
type StorageTypeWithFields = Prisma.StorageTypesGetPayload<{
   include: {
      StorageTypeFields: true;
   };
}>;

/**
 * Makes sure that the value is the correct type
 * @param type
 * @param value
 * @returns
 */
export const validateStorageFieldValue = (type: string | null, value: string): boolean => {
   switch (type) {
      case 'string':
         return true;

      case 'number':
         return !Number.isNaN(Number(value));

      case 'boolean':
         return value === 'true' || value === 'false';

      case 'date':
         return !Number.isNaN(Date.parse(value));

      default:
         return false;
   }
};

/**
 * Get the storage type from the database
 * @param id
 * @returns
 */
export async function getStorageTypeByID(id: number): Promise<StorageTypeWithFields | null> {
   // Get types from the database
   const storageType = await prisma.storageTypes.findUnique({
      where: {
         id
      },
      include: {
         StorageTypeFields: true
      }
   });

   return storageType ?? null;
}

/**
 * Gets the field from the storage type using its names
 * @param storageType
 * @param name
 * @returns
 */
export const getStorageFieldByName = (storageType: StorageTypeWithFields | null, name: string) =>
   new Map(storageType?.StorageTypeFields.map((field) => [field.name, field])).get(name);
