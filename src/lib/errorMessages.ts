import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Allows you to create a custom error response
 * @param c
 * @param error
 * @param details
 */
export function customError(
   c: Context,
   error: string,
   message?: string | null,
   details?: unknown | null,
   code?: ContentfulStatusCode | 500
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
 * Responds with an invalid parameters error message populated with the issues from
 * the validator
 * @param c
 * @param result
 * @returns
 */
export function invalidParametersRequestError(
   c: Context,
   result: { error: { issues: unknown[] } }
) {
   return customError(
      c,
      'INVALID_REQUEST_PARAMETERS',
      'One or more of the queries is invalid.',
      result.error.issues,
      400
   );
}

/**
 * Responds with an invalid body error message populated with the issues from
 * the validator
 * @param c
 * @param result
 * @returns
 */
export function invalidJsonRequestError(c: Context, result: { error: { issues: unknown[] } }) {
   return customError(
      c,
      'INVALID_REQUEST_JSON',
      'One or more of the queries is invalid.',
      result.error.issues,
      400
   );
}

/**
 * Responds with an invalid query error message populated with the issues from
 * the validator
 * @param c
 * @param result
 * @returns
 */
export function invalidQueryRequestError(c: Context, result: { error: { issues: unknown[] } }) {
   return customError(
      c,
      'INVALID_REQUEST_QUERY',
      'One or more of the queries is invalid.',
      result.error.issues,
      400
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

   return customError(c, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred.', null);
}

/**
 * Responds with a not found error message
 * @param c
 * @returns
 */
export function notFoundError(c: Context, message?: string) {
   return customError(
      c,
      'NOT_FOUND',
      message || 'The requested resource does not exist.',
      null,
      404
   );
}

/**
 * Responds with a existing resource error message
 * @param c
 * @returns
 */
export function existingResourceError(c: Context, message?: string) {
   return customError(
      c,
      'CONFLATING_RESOURCE',
      message || 'There is already a resource in the database',
      null,
      409
   );
}
