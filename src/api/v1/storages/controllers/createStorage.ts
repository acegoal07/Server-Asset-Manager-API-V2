import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { customError, internalServerError, notFoundError } from '../../../../lib/errorMessages';
import {
   getStorageFieldByName,
   getStorageTypeByID,
   validateStorageFieldValue
} from '../../../../lib/storageFields';
import { requestJsonValidator } from '../../../../lib/requestValidators';
import { storageSerializerArgs } from '../lib/includeSerializers';
import { serializeStorage } from '../lib/outputSerializers';

export default new Hono().post(
   '/',
   requestJsonValidator(
      z.object({
         name: z
            .string({ error: 'Name must be a string' })
            .min(1, { error: 'Name cannot be empty' }),
         notes: z.string({ error: 'Notes must be a string' }).nullable().optional(),
         storageTypeId: z
            .number({ error: 'Storage Type ID must be a number' })
            .int({ error: 'Storage Type ID must be an integer' })
            .positive({ error: 'Storage Type ID must be greater than 0' }),
         data: z.record(
            z.string({ error: 'Data field name must be a string' }),
            z.string({ error: 'Data field value must be a string' }),
            { error: 'Data must be an object containing string values' }
         )
      })
   ),
   async (c) => {
      try {
         // Get request information
         const body = c.req.valid('json');

         // Get storage type
         const storageType = await getStorageTypeByID(body.storageTypeId);

         // Check to make sure the type exists
         if (!storageType) {
            return notFoundError(c, `Could not find storage type with id: ${body.storageTypeId}.`);
         }

         // Create an errors record
         const errors: Record<string, string> = {};

         // Validate each field
         for (const [name, value] of Object.entries(body.data)) {
            const field = getStorageFieldByName(storageType, name);

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

         // Create the storage in the database
         const storage = await prisma.storages.create({
            data: {
               name: body.name,
               notes: body.notes,
               storageTypeId: body.storageTypeId,
               StorageData: {
                  create: Object.entries(body.data).map(([name, value]) => {
                     return {
                        fieldId: getStorageFieldByName(storageType, name)!.id,
                        value
                     };
                  })
               }
            },
            ...storageSerializerArgs
         });

         return c.json(serializeStorage(storage), 201);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
