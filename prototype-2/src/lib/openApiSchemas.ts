import { z } from '@hono/zod-openapi';

// ============================================================
// ERROR SCHEMAS
// ============================================================

/**
 * The openAPI docs for an bad request error
 */
export const BadRequestErrorSchema = {
   400: {
      description: 'Invalid request',
      content: {
         'application/json': {
            schema: z.object({
               error: z.string(),
               message: z.string().optional(),
               details: z.unknown().optional()
            })
         }
      }
   }
};

/**
 * The openAPI docs for a not found error
 */
export const NotFoundErrorSchema = {
   404: {
      description: 'Resource not found',
      content: {
         'application/json': {
            schema: z.object({
               error: z.string(),
               message: z.string()
            })
         }
      }
   }
};

/**
 * The openAPI docs for an conflict error
 */
export const ConflictErrorSchema = {
   409: {
      description: 'Domain already exists',
      content: {
         'application/json': {
            schema: z.object({
               error: z.string(),
               message: z.string()
            })
         }
      }
   }
};

/**
 * The openAPI docs for an internal server error
 */
export const InternalServerErrorSchema = {
   500: {
      description: 'Internal server error',
      content: {
         'application/json': {
            schema: z.object({
               error: z.string(),
               message: z.string()
            })
         }
      }
   }
};

// ============================================================
// PARAM SCHEMAS
// ============================================================

/**
 * The openAPI docs for an id
 */
export const IdParamSchema = {
   id: z.coerce
      .number({ error: 'ID must be a number' })
      .int({ error: 'ID must be an integer' })
      .positive({
         error: 'ID must be greater than 0'
      })
};

// ============================================================
// DATA FIELDS SCHEMAS
// ============================================================

/**
 * Upset openAPI docs schema
 */
export const UpsertDataFieldSchema = z
   .object({
      identifier: z
         .string({ error: 'Identifier must be string' })
         .trim()
         .min(1, { error: 'Identifier cannot be empty' })
         .optional(),
      name: z
         .string({ error: 'Name must be string' })
         .trim()
         .min(1, { error: 'Name cannot be empty' })
         .optional(),
      type: z
         .string({ error: 'Type must be string' })
         .trim()
         .min(1, { error: 'Type cannot be empty' }),
      value: z.string({ error: 'Value must be string' }).trim().nullable()
   })
   .refine((field) => field.identifier !== undefined || field.name !== undefined, {
      message: 'Either identifier or name must be provided',
      path: ['identifier']
   })
   .openapi('UpsertDataField');

/**
 * Delete data field OpenAPI schema
 */
export const DeleteDataFieldSchema = z
   .object({
      identifier: z
         .string({ error: 'Identifier must be string' })
         .trim()
         .min(1, { error: 'Identifier cannot be empty' }),
      delete: z.literal(true)
   })
   .openapi('DeleteDataField');

/**
 * Create data field openAPI schema
 */
export const CreateDataFieldSchema = z
   .object({
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
 * Data fields OpenAPI union schema
 */
export const DataFieldSchema = z.union([UpsertDataFieldSchema, DeleteDataFieldSchema]);

/**
 * Returned data field openAPI schema
 */
export const DataFieldsReturnSchema = z.object({
   id: z.number().nullable(),
   identifier: z.string(),
   name: z.string(),
   type: z.string(),
   value: z.string().nullable(),
   raw: z.string().optional(),
   deletable: z.boolean()
});
