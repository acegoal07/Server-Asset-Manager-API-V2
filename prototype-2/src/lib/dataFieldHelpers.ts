import { Prisma } from '@prisma/client';

type FieldParams =
   | {
        action: 'create';
        name: string;
        identifier: string;
        type: string;
        value: string | null;
     }
   | {
        action: 'update';
        identifier: string;
        type: string;
        value: string | null;
     }
   | {
        action: 'delete';
        identifier: string;
     };

/**
 * Takes in an array of fields. Will update fields where that identifier exitst, create a new field when the identifier doesn't exist, and delete it when specified
 * @param fields
 * @returns
 */
export async function updateDataFields(
   prisma: Prisma.TransactionClient,
   dataId: number,
   fields: FieldParams[]
) {
   const creates = fields.filter((f) => f.action === 'create');
   const updates = fields.filter((f) => f.action === 'update');
   const deletes = fields.filter((f) => f.action === 'delete');

   return prisma.$transaction([
      prisma.dataFields.deleteMany({
         where: {
            dataId,
            identifier: {
               in: deletes.map((f) => f.identifier)
            }
         }
      }),

      ...creates.map((field) =>
         prisma.dataFields.create({
            data: {
               dataId,
               name: field.name,
               identifier: field.identifier,
               type: field.type,
               value: field.value
            }
         })
      ),

      ...updates.map((field) =>
         prisma.dataFields.update({
            where: {
               dataId_identifier: {
                  dataId,
                  identifier: field.identifier
               }
            },
            data: {
               type: field.type,
               value: field.value
            }
         })
      )
   ]);
}
