import { requestJsonValidator, requestQueryValidator } from '../../../../lib/requestValidators';
import { z } from 'zod';

export const assetValidator = requestJsonValidator(
   z.object({
      name: z.string().min(1),
      notes: z.string().nullable().optional(),
      uSize: z.number().int().default(1),
      uTop: z.number().int().default(0),
      uBottom: z.number().int().default(0),
      assetTypeId: z.number().int().positive(),
      data: z.record(z.string(), z.string())
   })
);

export const updateAssetValidator = requestJsonValidator(
   z.object({
      name: z.string().min(1).optional(),
      notes: z.string().nullable().optional(),
      uSize: z.number().int().optional(),
      uTop: z.number().int().optional(),
      uBottom: z.number().int().optional(),
      data: z.record(z.string(), z.string()).optional()
   })
);

export const assetQueryValidator = requestQueryValidator(
   z.object({
      typeId: z.coerce.number().int().positive().optional(),
      type: z.string().min(1).optional()
   })
);
