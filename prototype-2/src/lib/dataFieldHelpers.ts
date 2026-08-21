import { Prisma } from '@prisma/client';
import merge from 'deepmerge';
import { Eta } from 'eta';

import { getIpFromMask } from './ipMask';

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
export type dataField = {
   id: number | null;
   dataId: number | null;
   name: string;
   identifier: string;
   type: string;
   value: string | null;
   raw?: string | undefined;
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
   domain?: dataField[];
   primaryGender?: dataField[];
   subGenders?: dataField[];
   node?: dataField[];
}): dataField[] {
   const mergeByName = (target: dataField[], source: dataField[]): dataField[] => {
      return source.reduce<dataField[]>(
         (result, sourceItem) => {
            const index = result.findIndex(
               (targetItem) => targetItem.identifier === sourceItem.identifier
            );

            if (index === -1) {
               result.push(sourceItem);
            } else {
               result[index] = merge(result[index], sourceItem, {
                  arrayMerge: mergeByName
               }) as dataField;
            }

            return result;
         },
         [...target]
      );
   };

   return merge.all([domain, subGenders, primaryGender, node], {
      arrayMerge: mergeByName
   }) as dataField[];
}

/**
 * Checks the node data fields for a ip-address and if not adds it with generated ip
 * @param dataFields
 * @param index
 * @param ipMask
 * @returns
 */
export function checkNodeDataFieldsForIP(dataFields: dataField[], index: number, ipMask: string) {
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
 * Takes in the data fields and renders any that are eta strings
 * @param dataFields
 * @param domain
 * @returns
 */
export function checkDataFieldForETA(
   dataFields: Record<string, dataField>,
   domain: object
): Record<string, dataField> {
   const eta = new Eta();

   return Object.fromEntries(
      Object.entries(dataFields).map(([key, field]) => {
         if (
            field.type !== 'eta' ||
            !field.value ||
            field.value.toLowerCase().includes('process.env')
         ) {
            return [key, field];
         }

         try {
            return [
               key,
               {
                  ...field,
                  value: eta.renderString(field.value, {
                     ...domain,
                     ...dataFields
                  }),
                  raw: field.value
               }
            ];
         } catch {
            return [key, field];
         }
      })
   );
}
