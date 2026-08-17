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
   console.log(`\n→ ${c.req.method} ${c.req.path}`);

   const contentType = c.req.header('content-type') ?? '';

   if (contentType.includes('application/json')) {
      try {
         // Clone so we don't consume the request body
         const body = await c.req.raw.clone().json();

         console.log('Body:', truncate(body));
      } catch {
         console.log('Body: <invalid JSON>');
      }
   } else {
      console.log('Body: <not JSON>');
   }

   await next();
};
