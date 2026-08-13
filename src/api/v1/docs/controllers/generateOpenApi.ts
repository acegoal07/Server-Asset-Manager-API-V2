import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { openApiSchema, type OpenApiSchema, type OpenApiDocument } from '../lib/openapi';

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
   type PortTypeExample = {
      portTypeId: number;
      count: number;
   };

   const assetExamples: Record<
      string,
      {
         summary: string;
         value: {
            name: string;
            notes: string;
            position: number;
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

            position: 0,

            assetTypeId: assetType.id,

            data
         }
      };
   }

   /*
    * Add the generated examples to the
    * POST /api/assets request body.
    */
   const assetsPath = schema.paths['/api/assets'];

   const createAssetOperation = assetsPath?.post;

   const requestBody = createAssetOperation?.requestBody;

   const jsonContent = requestBody?.content['application/json'];

   if (jsonContent) {
      jsonContent.examples = assetExamples;
   }

   return c.json(schema);
});
