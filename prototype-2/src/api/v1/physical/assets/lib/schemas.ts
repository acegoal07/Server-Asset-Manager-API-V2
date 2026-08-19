import { z } from '@hono/zod-openapi';

export const AssetReturnSchema = z.object({
   id: z.number(),
   name: z.string(),
   notes: z.string().nullable(),
   uSize: z.number(),
   uTop: z.number(),
   uBottom: z.number()
});
