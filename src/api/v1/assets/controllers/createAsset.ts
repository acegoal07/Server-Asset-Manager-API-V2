import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import { customError, internalServerError, notFoundError } from '../../../../lib/errorMessages';
import {
   getAssetTypeByID,
   getAssetFieldByName,
   validateAssetFieldValue
} from '../../../../lib/assetFields';
import { requestJsonValidator } from '../../../../lib/requestValidators';
import { assetSerializerArgs } from '../lib/includeSerializers';
import { serializeAsset } from '../lib/outputSerializers';

export default new Hono().post(
   '/',
   requestJsonValidator(
      z.object({
         name: z
            .string({ error: 'Name must be a string' })
            .min(1, { error: 'Name cannot be empty' }),
         notes: z.string({ error: 'Notes must be a string' }).nullable().optional(),
         uSize: z
            .number({ error: 'uSize must be a number' })
            .int({ error: 'uSize must be an integer' })
            .default(1),
         uTop: z
            .number({ error: 'uTop must be a number' })
            .int({ error: 'uTop must be an integer' })
            .default(0),
         uBottom: z
            .number({ error: 'uBottom must be a number' })
            .int({ error: 'uBottom must be an integer' })
            .default(0),
         assetTypeId: z
            .number({ error: 'Asset Type ID must be a number' })
            .int({ error: 'Asset Type ID must be an integer' })
            .positive({ error: 'Asset Type ID must be greater than 0' }),
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

         // Get assetType
         const assetType = await getAssetTypeByID(body.assetTypeId);

         // Check that a assetType was found
         if (!assetType) {
            return notFoundError(c, `Asset type with id: ${body.assetTypeId} could not be found.`);
         }

         // Create an error record
         const errors: Record<string, string> = {};

         // Go through all the fields and check them for errors
         for (const [name, value] of Object.entries(body.data)) {
            const field = getAssetFieldByName(assetType, name);

            if (!field) {
               errors[name] = 'Field does not exist on this asset type';
               continue;
            }

            if (!validateAssetFieldValue(field.type, value)) {
               errors[name] = `Value does not match field type "${field.type}"`;
            }
         }

         // If there is any error return the information
         if (Object.keys(errors).length > 0) {
            return customError(c, { error: 'INVALID_ASSET_DATA', details: errors, code: 400 });
         }

         // Create asset in the database
         const asset = await prisma.assets.create({
            data: {
               name: body.name,
               notes: body.notes,
               uSize: body.uSize,
               uTop: body.uTop,
               uBottom: body.uBottom,
               assetTypeId: body.assetTypeId,
               AssetData: {
                  create: Object.entries(body.data).map(([name, value]) => {
                     const field = getAssetFieldByName(assetType, name)!;

                     return {
                        fieldId: field.id,
                        value
                     };
                  })
               }
            },
            ...assetSerializerArgs
         });

         return c.json(serializeAsset(asset), 201);
      } catch (err) {
         return internalServerError(c, err);
      }
   }
);
