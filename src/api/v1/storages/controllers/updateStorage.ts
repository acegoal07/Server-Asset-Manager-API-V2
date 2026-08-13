import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { storageSerializerArgs, serializeStorage } from '../lib/serialisers';
import { updateStorageValidator } from '../lib/validators';
import { notFoundError } from '../../../../lib/errorMessages';
import { requestIdValidator } from '../../../../lib/requestValidators';

const validateFieldValue = (type: string | null, value: string): boolean => {
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

export default new Hono().patch(
   '/:id',
   updateStorageValidator,
   requestIdValidator({}),
   async (c) => {
      const { id } = c.req.valid('param');
      const body = c.req.valid('json');

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

      if (!storage) {
         return notFoundError(c, `Storage with id: ${id} could not be found.`);
      }

      if (body.data) {
         const fieldsByName = new Map(
            storage.StorageTypes?.StorageTypeFields.map((field) => [field.name, field])
         );

         const errors: Record<string, string> = {};

         for (const [name, value] of Object.entries(body.data)) {
            const field = fieldsByName.get(name);

            if (!field) {
               errors[name] = 'Field does not exist on this storage type';
               continue;
            }

            if (!validateFieldValue(field.type, value)) {
               errors[name] = `Value does not match field type "${field.type}"`;
            }
         }

         if (Object.keys(errors).length > 0) {
            return c.json(
               {
                  error: 'Invalid storage data',
                  fields: errors
               },
               400
            );
         }
      }

      const updatedStorage = await prisma.$transaction(async (tx) => {
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
            }
         });

         if (body.data) {
            const fieldsByName = new Map(
               storage.StorageTypes?.StorageTypeFields.map((field) => [field.name, field])
            );

            for (const [name, value] of Object.entries(body.data)) {
               const field = fieldsByName.get(name)!;

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

      if (!updatedStorage) {
         return c.json(
            {
               error: 'Storage not found'
            },
            404
         );
      }

      return c.json(serializeStorage(updatedStorage));
   }
);
