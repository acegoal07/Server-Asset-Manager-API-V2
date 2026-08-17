import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

/**
 * The assetType
 */
type AssetTypeWithFields = Prisma.AssetTypesGetPayload<{
   include: {
      AssetTypeFields: true;
   };
}>;

/**
 * Makes sure that the value is the correct type
 * @param type
 * @param value
 * @returns
 */
export const validateFieldValue = (type: string | null, value: string): boolean => {
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
 * Get the asset type from the database
 * @param id
 * @returns
 */
export async function getAssetTypeByID(id: number): Promise<AssetTypeWithFields | null> {
   // Get types from the database
   const assetType = await prisma.assetTypes.findUnique({
      where: {
         id
      },
      include: {
         AssetTypeFields: true
      }
   });

   // Check if there is an assetType
   if (!assetType) {
      return null;
   }

   return assetType;
}

/**
 * Gets the field from the asset type using its names
 * @param assetType
 * @param name
 * @returns
 */
export function getFieldByName(assetType: AssetTypeWithFields | null, name: string) {
   const names = new Map(assetType?.AssetTypeFields.map((field) => [field.name, field]));

   return names.get(name);
}
