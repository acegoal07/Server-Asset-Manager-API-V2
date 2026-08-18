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
   {
      error,
      message,
      details,
      code = 500
   }: {
      error: string;
      message?: string;
      details?: unknown;
      code?: ContentfulStatusCode;
   }
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
   return customError(c, {
      error: 'INVALID_REQUEST_PARAMETERS',
      message: 'One or more of the queries is invalid.',
      details: result.error.issues,
      code: 400
   });
}

/**
 * Responds with an invalid body error message populated with the issues from
 * the validator
 * @param c
 * @param result
 * @returns
 */
export function invalidJsonRequestError(c: Context, result: { error: { issues: unknown[] } }) {
   return customError(c, {
      error: 'INVALID_REQUEST_JSON',
      message: 'One or more of the queries is invalid.',
      details: result.error.issues,
      code: 400
   });
}

/**
 * Responds with an invalid query error message populated with the issues from
 * the validator
 * @param c
 * @param result
 * @returns
 */
export function invalidQueryRequestError(c: Context, result: { error: { issues: unknown[] } }) {
   return customError(c, {
      error: 'INVALID_REQUEST_QUERY',
      message: 'One or more of the queries is invalid.',
      details: result.error.issues,
      code: 400
   });
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
         message: 'An unexpected error occurred.',
         details: undefined
      },
      500
   );
} /**
 * Responds with a not found error message
 * @param c
 * @returns
 */
export function notFoundError(c: Context, message?: string) {
   return c.json(
      {
         error: 'NOT_FOUND',
         message: message || 'The requested resource does not exist.',
         details: undefined
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
         message: message || 'There is already a resource in the database',
         details: undefined
      },
      409
   );
}
