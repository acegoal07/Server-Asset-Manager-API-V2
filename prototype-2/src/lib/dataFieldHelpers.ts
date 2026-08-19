import { Prisma } from '@prisma/client';
import { z } from '@hono/zod-openapi';

type FieldParams =
   | {
        action: 'create';
        name: string;
        type: string;
        value: string | null;
     }
   | {
        action: 'update';
        identifier: string;
        value: string | null;
     }
   | {
        action: 'delete';
        identifier: string;
     };

/**
 * Takes in an array of fields. Will update fields where that identifier exist, create a new field when the identifier doesn't exist, and delete it when specified
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
               identifier: field.name.toLowerCase().replaceAll(' ', '-'),
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
               value: field.value
            }
         })
      )
   ]);
}

/**
 * Create data field openAPI schema
 */
export const CreateDataFieldSchema = z
   .object({
      action: z.literal('create'),
      name: z
         .string({ error: 'Name must be string' })
         .trim()
         .min(1, { error: 'Name cannot be empty' }),
      type: z
         .string({ error: 'Type must be string' })
         .trim()
         .min(1, { error: 'Type cannot be empty' }),
      value: z.string({ error: 'Value must be string' }).trim().nullable()
   })
   .openapi('CreateDataField');

/**
 * Update data field openAPI schema
 */
export const UpdateDataFieldSchema = z
   .object({
      action: z.literal('update'),
      identifier: z
         .string({ error: 'Identifier must be string' })
         .trim()
         .min(1, { error: 'Identifier cannot be empty' }),
      value: z.string({ error: 'Value must be string' }).trim().nullable()
   })
   .openapi('UpdateDataField');

/**
 * Delete data field openAPI schema
 */
export const DeleteDataFieldSchema = z
   .object({
      action: z.literal('delete'),
      identifier: z
         .string({ error: 'Identifier must be string' })
         .trim()
         .min(1, { error: 'Identifier cannot be empty' })
   })
   .openapi('DeleteDataField');

/**
 * Data fields openAPI union schema
 */
export const DataFieldSchema = z.discriminatedUnion('action', [
   CreateDataFieldSchema,
   UpdateDataFieldSchema,
   DeleteDataFieldSchema
]);

/**
 * Returned data field openAPI schema
 */
export const DataFieldsReturnSchema = z.object({
   id: z.number(),
   identifier: z.string(),
   name: z.string(),
   type: z.string(),
   value: z.string().nullable(),
   deletable: z.boolean()
});
