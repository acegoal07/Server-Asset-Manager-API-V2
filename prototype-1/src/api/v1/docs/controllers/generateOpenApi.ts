import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { openApiSchema, type OpenApiSchema, type OpenApiDocument } from '../lib/openapi';
import { internalServerError } from '../../../../lib/errorMessages';

const openApiType = (
   type: string | null
): {
   type: string;
   format?: string;
} => {
   switch (type) {
      case 'number':
         return {
            type: 'number'
         };

      case 'boolean':
         return {
            type: 'boolean'
         };

      case 'date':
         return {
            type: 'string',
            format: 'date'
         };

      case 'string':
      default:
         return {
            type: 'string'
         };
   }
};

const exampleValue = (type: string | null): string => {
   switch (type) {
      case 'number':
         return '0';

      case 'boolean':
         return 'true';

      case 'date':
         return '2026-01-01';

      case 'string':
      default:
         return 'string';
   }
};

const schemaName = (name: string | null, id: number): string => {
   if (!name) {
      return `AssetType_${id}`;
   }

   const safeName = name.trim().replace(/[^a-zA-Z0-9_]/g, '_');

   return `AssetType_${safeName}_${id}`;
};

export default new Hono().get('/', async (c) => {
   try {
      const assetTypes = await prisma.assetTypes.findMany({
         include: {
            AssetTypeFields: true
         },
         orderBy: {
            id: 'asc'
         }
      });

      const schema: OpenApiDocument = structuredClone(openApiSchema);

      const schemas: Record<string, OpenApiSchema> = schema.components.schemas;

      /*
       * Generate schemas for each database asset type.
       */
      for (const assetType of assetTypes) {
         const properties: Record<string, OpenApiSchema> = {};

         const required: string[] = [];

         for (const field of assetType.AssetTypeFields) {
            if (!field.name) {
               continue;
            }

            properties[field.name] = {
               ...openApiType(field.type),
               description: `Asset field of type "${field.type ?? 'string'}"`,
               example: exampleValue(field.type)
            };

            required.push(field.name);
         }

         const name = schemaName(assetType.name, assetType.id);

         schemas[name] = {
            type: 'object',
            properties,

            ...(required.length > 0
               ? {
                    required
                 }
               : {})
         };
      }

      /*
       * Generate examples for POST /api/assets.
       */

      const assetExamples: Record<
         string,
         {
            summary: string;
            value: {
               name: string;
               notes: string;
               uSize: number;
               uTop: number;
               uBottom: number;
               assetTypeId: number;
               data: Record<string, string>;
            };
         }
      > = {};

      for (const assetType of assetTypes) {
         const data: Record<string, string> = {};

         for (const field of assetType.AssetTypeFields) {
            if (!field.name) {
               continue;
            }
            data[field.name] = exampleValue(field.type);
         }

         assetExamples[`assetType_${assetType.id}`] = {
            summary: `${assetType.name ?? 'Asset'} example`,

            value: {
               name: `Example ${assetType.name ?? 'Asset'}`,

               notes: 'Example asset',

               uSize: 2,

               uTop: 5,

               uBottom: 3,

               assetTypeId: assetType.id,

               data
            }
         };
      }

      /*
       * Add the generated examples to the
       * POST /api/assets request body.
       */
      const assetsPath = schema.paths['/assets'];

      const createAssetOperation = assetsPath?.post;

      const requestBody = createAssetOperation?.requestBody;

      const jsonContent = requestBody?.content['application/json'];

      if (jsonContent) {
         jsonContent.examples = assetExamples;
      }

      /*
       * Generate examples for POST /api/storages.
       */

      const storageTypes = await prisma.storageTypes.findMany({
         include: {
            StorageTypeFields: true
         },
         orderBy: {
            id: 'asc'
         }
      });

      const storageExamples: Record<
         string,
         {
            summary: string;
            value: {
               name: string;
               notes: string;
               storageTypeId: number;
               data: Record<string, string>;
            };
         }
      > = {};

      for (const storageType of storageTypes) {
         const data: Record<string, string> = {};

         for (const field of storageType.StorageTypeFields) {
            if (!field.name) {
               continue;
            }

            data[field.name] = exampleValue(field.type);
         }

         storageExamples[`storageType_${storageType.id}`] = {
            summary: `${storageType.name ?? 'Storage'} example`,

            value: {
               name: `Example ${storageType.name ?? 'Storage'}`,

               notes: 'Example storage',

               storageTypeId: storageType.id,

               data
            }
         };
      }

      const storagesPath = schema.paths['/storages'];

      const createStorageOperation = storagesPath?.post;

      const storageRequestBody = createStorageOperation?.requestBody;

      const storageJsonContent = storageRequestBody?.content['application/json'];

      if (storageJsonContent) {
         storageJsonContent.examples = storageExamples;
      }

      return c.json(schema);
   } catch (err) {
      return internalServerError(c, err);
   }
});
