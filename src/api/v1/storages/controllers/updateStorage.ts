import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { customError, internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import { getStorageFieldByName, validateStorageFieldValue } from '../../../../lib/storageFields';
import { storageSerializerArgs } from '../lib/includeSerializers';
import { serializeStorage } from '../lib/outputSerializers';

export default new Hono().patch(
   '/',
   requestIdValidator({}),
   requestJsonValidator(
      z
         .object({
            name: z
               .string({ error: 'Name must be a string' })
               .min(1, { error: 'Name cannot be empty' })
               .optional(),
            notes: z.string({ error: 'Notes must be a string' }).nullable().optional(),
            data: z
               .record(
                  z.string({ error: 'Data field name must be a string' }),
                  z.string({ error: 'Data field value must be a string' }),
                  { error: 'Data must be an object containing string values' }
               )
               .optional()
         })
         .refine((data) => Object.keys(data).length > 0, {
            error: 'At least one field must be provided'
         })
   ),
   async (c) => {
      try {
         // Get the request information
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Try and get the storage from the database
         const storage = await prisma.storages.findUnique({
            where: {
               id
            },
            include: {
               StorageTypes: {
                  include: {
                     StorageTypeFields: true
                  }
               }
            }
         });

         // Check if the storage exists
         if (!storage) {
            return notFoundError(c, `Storage with id: ${id} could not be found.`);
         }

         if (body.data) {
            // Create an error record
            const errors: Record<string, string> = {};

            // Validate each of the fields
            for (const [name, value] of Object.entries(body.data)) {
               const field = getStorageFieldByName(storage.StorageTypes, name);

               if (!field) {
                  errors[name] = 'Field does not exist on this storage type';
                  continue;
               }

               if (!validateStorageFieldValue(field.type, value)) {
                  errors[name] = `Value does not match field type "${field.type}"`;
               }
            }

            // Respond with the errors if there is any
            if (Object.keys(errors).length > 0) {
               return customError(c, 'INVALID_STORAGE_DATA', null, errors, 400);
            }
         }

         // Update the storage
         const updatedStorage = await prisma.$transaction(async (tx) => {
            // Update the storages information
            await tx.storages.update({
               where: {
                  id
               },
               data: {
                  ...(body.name !== undefined && {
                     name: body.name
                  }),
                  ...(body.notes !== undefined && {
                     notes: body.notes
                  })
               },
               select: {
                  id: true
               }
            });

            // Update the fields
            if (body.data) {
               for (const [name, value] of Object.entries(body.data)) {
                  const field = getStorageFieldByName(storage.StorageTypes, name)!;

                  await tx.storageData.upsert({
                     where: {
                        storageId_fieldId: {
                           storageId: id,
                           fieldId: field.id
                        }
                     },
                     create: {
                        storageId: id,
                        fieldId: field.id,
                        value
                     },
                     update: {
                        value
                     },
                     select: {
                        id: true
                     }
                  });
               }
            }

            return tx.storages.findUnique({
               where: {
                  id
               },
               ...storageSerializerArgs
            });
         });

         return c.json(serializeStorage(updatedStorage!));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
