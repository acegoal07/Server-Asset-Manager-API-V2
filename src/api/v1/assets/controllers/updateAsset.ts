import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { customError, internalServerError, notFoundError } from '../../../../lib/errorMessages';
import { requestIdValidator, requestJsonValidator } from '../../../../lib/requestValidators';
import { getFieldByName, validateFieldValue } from '../../../../lib/assetFields';
import { assetSerializerArgs } from '../lib/includeSerializers';
import { serializeAsset } from '../lib/outputSerializers';

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
            uSize: z
               .number({ error: 'uSize must be a number' })
               .int({ error: 'uSize must be an integer' })
               .optional(),
            uTop: z
               .number({ error: 'uTop must be a number' })
               .int({ error: 'uTop must be an integer' })
               .optional(),
            uBottom: z
               .number({ error: 'uBottom must be a number' })
               .int({ error: 'uBottom must be an integer' })
               .optional(),
            data: z
               .record(
                  z.string({ error: 'Field name must be a string' }),
                  z.string({ error: 'Field value must be a string' }),
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
         // Get request information
         const { id } = c.req.valid('param');
         const body = c.req.valid('json');

         // Try and get the asset from the database
         const asset = await prisma.assets.findUnique({
            where: {
               id
            },
            include: {
               AssetTypes: {
                  include: {
                     AssetTypeFields: true
                  }
               }
            }
         });

         // Check to make sure the asset exists
         if (!asset) {
            return notFoundError(c, `Asset with id: ${id} could not be found.`);
         }

         // validate fields
         if (body.data) {
            // Create an error record
            const errors: Record<string, string> = {};

            // Go through all the fields and validate them
            for (const [name, value] of Object.entries(body.data)) {
               const field = getFieldByName(asset.AssetTypes, name);

               if (!field) {
                  errors[name] = 'Field does not exist on this asset type';

                  continue;
               }

               if (!validateFieldValue(field.type, value)) {
                  errors[name] = `Value does not match field type "${field.type}"`;
               }
            }

            // If there are any errors respond with them
            if (Object.keys(errors).length > 0) {
               return customError(c, 'INVALID_ASSET_DATA', null, errors, 400);
            }
         }

         // Update the asset
         const updatedAsset = await prisma.$transaction(async (tx) => {
            // update asset information
            await tx.assets.update({
               where: {
                  id
               },
               data: {
                  ...(body.name !== undefined && {
                     name: body.name
                  }),
                  ...(body.notes !== undefined && {
                     notes: body.notes
                  }),
                  ...(body.uSize !== undefined && {
                     uSize: body.uSize
                  }),
                  ...(body.uTop !== undefined && {
                     uTop: body.uTop
                  }),
                  ...(body.uBottom !== undefined && {
                     uBottom: body.uBottom
                  })
               }
            });

            // update asset fields
            if (body.data) {
               for (const [name, value] of Object.entries(body.data)) {
                  const field = getFieldByName(asset.AssetTypes, name)!;
                  await tx.assetData.upsert({
                     where: {
                        assetId_fieldId: {
                           assetId: id,
                           fieldId: field.id
                        }
                     },
                     create: {
                        assetId: id,
                        fieldId: field.id,
                        value
                     },
                     update: {
                        value
                     }
                  });
               }
            }

            return tx.assets.findUnique({
               where: {
                  id
               },
               ...assetSerializerArgs
            });
         });

         return c.json(serializeAsset(updatedAsset!));
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
