import { Prisma } from '@prisma/client';
import merge from 'deepmerge';
import { getIpFromMask } from './ipMask';
import { Eta } from 'eta';

type FieldParams =
   | {
      identifier?: string;
      name?: string;
      type: string;
      value: string | null;
   }
   | {
      identifier: string;
      delete: true;
   };

/**
 * Datafield type
 */
export type dataFields = {
   id: number | null;
   dataId: number | null;
   name: string;
   identifier: string;
   type: string;
   value: string | null;
   deletable: boolean;
};

/**
 * Takes in an array of fields. Will update fields where that identifier
 * exists, create a new field when the identifier doesn't exist, and
 * delete it when specified.
 */
export async function updateDataFields(
   prisma: Prisma.TransactionClient,
   dataId: number,
   fields: FieldParams[]
) {
   return Promise.all(
      fields.map((field) => {
         if ('delete' in field) {
            return prisma.dataFields.deleteMany({
               where: {
                  dataId,
                  identifier: field.identifier
               }
            });
         }

         const identifier = field.identifier ?? field.name?.toLowerCase().replaceAll(' ', '-');

         if (!identifier) {
            throw new Error('Either identifier or name must be provided');
         }

         return prisma.dataFields.upsert({
            where: {
               dataId_identifier: {
                  dataId,
                  identifier
               }
            },
            update: {
               ...(field.name && { name: field.name }),
               type: field.type,
               value: field.value
            },
            create: {
               dataId,
               name: field.name ?? identifier,
               identifier,
               type: field.type,
               value: field.value
            }
         });
      })
   );
}

/**
 * Handles the merge of the three lays of data fields ordering them correctly
 * @param domain
 * @param primaryGender
 * @param subGenders
 * @param node
 * @returns
 */
export function handleDataFieldsMerge({
   domain = [],
   primaryGender = [],
   subGenders = [],
   node = []
}: {
   domain?: dataFields[];
   primaryGender?: dataFields[];
   subGenders?: dataFields[];
   node?: dataFields[];
}): dataFields[] {
   const mergeByName = (target: dataFields[], source: dataFields[]): dataFields[] => {
      return source.reduce<dataFields[]>(
         (result, sourceItem) => {
            const index = result.findIndex(
               (targetItem) => targetItem.identifier === sourceItem.identifier
            );

            if (index === -1) {
               result.push(sourceItem);
            } else {
               result[index] = merge(result[index], sourceItem, {
                  arrayMerge: mergeByName
               }) as dataFields;
            }

            return result;
         },
         [...target]
      );
   };

   return merge.all([domain, subGenders, primaryGender, node], {
      arrayMerge: mergeByName
   }) as dataFields[];
}

/**
 * Checks the node data fields for a ip-address and if not adds it with generated ip
 * @param dataFields
 * @param index
 * @param ipMask
 * @returns
 */
export function checkNodeDataFieldsForIP(dataFields: dataFields[], index: number, ipMask: string) {
   return dataFields.some((field) => field.identifier === 'ip-address')
      ? dataFields
      : [
         ...dataFields,
         {
            id: null,
            dataId: null,
            name: 'IP Address',
            identifier: 'ip-address',
            type: 'string',
            value: getIpFromMask(ipMask, index + 1),
            deletable: false
         }
      ];
}

/**
 * Convert the array of data fields to a key object using their identifiers
 * @param dataFields
 * @returns
 */
export function convertDataFieldsToKey(dataFields: dataFields[]): Record<string, dataFields> {
   return Object.fromEntries(dataFields.map((field) => [field.identifier, field]));
}

/**
 * Takes in the data fields and renders any that are eta strings
 * @param dataFields
 * @param domain
 * @returns
 */
export function checkDataFieldForETA(dataFields: object, domain: object): Record<string, dataFields> {
   const eta = new Eta();

   return Object.fromEntries(
      Object.entries(dataFields).map(([key, field]) => {
         if (field.type !== 'eta' || !field.value) {
            return [key, field];
         }

         if (field.value.toLowerCase().includes('process.env')) {
            return [key, field];
         }

         return [
            key,
            {
               ...field,
               value: eta.renderString(field.value, domain),
               raw: field.value
            }
         ];
      })
   );

   // return dataFields.map((field) => {
   //    if (field.type !== 'eta' || !field.value) {
   //       return field;
   //    }

   //    if (field.value.toLowerCase().includes('process.env')) {
   //       return field;
   //    }

   //    return {
   //       ...field,
   //       value: eta.renderString(field.value, domain),
   //       raw: field.value
   //    };
   // });
}
