import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { storageSerializerArgs, serializeStorage } from '../lib/serialisers';
import { storageValidator } from '../lib/validators';
import { internalServerError, notFoundError } from '../../../../lib/errorMessages';

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

export default new Hono().post('/', storageValidator, async (c) => {
   try {
      const body = c.req.valid('json');

      const storageType = await prisma.storageTypes.findUnique({
         where: {
            id: body.storageTypeId
         },
         include: {
            StorageTypeFields: true
         }
      });

      if (!storageType) {
         return notFoundError(c, `Could not find storage type with id: ${body.storageTypeId}.`);
      }

      const fieldsByName = new Map(
         storageType.StorageTypeFields.map((field) => [field.name, field])
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

      const storage = await prisma.storages.create({
         data: {
            name: body.name,
            notes: body.notes,
            storageTypeId: body.storageTypeId,

            StorageData: {
               create: Object.entries(body.data).map(([name, value]) => {
                  const field = fieldsByName.get(name)!;

                  return {
                     fieldId: field.id,
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
});
