import type { MiddlewareHandler } from 'hono';

const MAX_STRING_LENGTH = 100;

function truncate(value: unknown): unknown {
   if (typeof value === 'string') {
      if (value.length <= MAX_STRING_LENGTH) {
         return value;
      }

      return `${value.slice(0, MAX_STRING_LENGTH)}... [truncated]`;
   }

   if (Array.isArray(value)) {
      return value.map(truncate);
   }

   if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
         Object.entries(value).map(([key, value]) => [key, truncate(value)])
      );
   }

   return value;
}

export const debugLogger: MiddlewareHandler = async (c, next) => {
   const start = performance.now();

   let body: unknown = undefined;

   const contentType = c.req.header('content-type') ?? '';

   if (contentType.includes('application/json')) {
      try {
         body = truncate(await c.req.raw.clone().json());
      } catch {
         body = '<invalid JSON>';
      }
   }

   await next();

   const duration = Math.round(performance.now() - start);

   const lines = [
      `→ ${c.req.method} ${c.req.path}`,
      `Body: ${body !== undefined ? JSON.stringify(body, null, 2) : '<none>'}`,
      `← ${c.res.status} ${duration}ms`
   ];

   console.log(`\n${lines.join('\n')}\n`);
};
