import { requestJsonValidator, requestQueryValidator } from '../../../../lib/requestValidators';
import { z } from 'zod';

export const storageValidator = requestJsonValidator(
   z.object({
      name: z.string().min(1),
      notes: z.string().nullable().optional(),
      storageTypeId: z.number().int().positive(),
      data: z.record(z.string(), z.string())
   })
);

export const updateStorageValidator = requestJsonValidator(
   z.object({
      name: z.string().min(1).optional(),
      notes: z.string().nullable().optional(),
      data: z.record(z.string(), z.string()).optional()
   })
);

export const storageQueryValidator = requestQueryValidator(
   z.object({
      typeId: z.coerce.number().int().positive().optional(),
      type: z.string().min(1).optional()
   })
);
