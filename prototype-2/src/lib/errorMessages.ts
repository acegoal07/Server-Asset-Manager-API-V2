import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Allows you to create a custom error response
 * @param c
 * @param error
 * @param details
 */
export function customError<S extends ContentfulStatusCode>(
   c: Context,
   {
      error,
      message,
      details
   }: {
      error: string;
      message: string;
      details?: unknown;
   },
   code: S
) {
   return c.json(
      {
         error,
         message,
         details
      },
      code
   );
}

/**
 * Responds with a internal server error message
 * @param c
 * @param err
 * @returns
 */
export function internalServerError(c: Context, err: unknown) {
   console.error(err);

   return c.json(
      {
         error: 'INTERNAL_SERVER_ERROR',
         message: 'An unexpected error occurred.'
      },
      500
   );
}

/**
 * Responds with a not found error message
 * @param c
 * @returns
 */
export function notFoundError(c: Context, message?: string) {
   return c.json(
      {
         error: 'NOT_FOUND',
         message: message || 'The requested resource does not exist.'
      },
      404
   );
}

/**
 * Responds with a existing resource error message
 * @param c
 * @returns
 */
export function existingResourceError(c: Context, message?: string) {
   return c.json(
      {
         error: 'CONFLATING_RESOURCE',
         message: message || 'There is already a resource in the database'
      },
      409
   );
}
