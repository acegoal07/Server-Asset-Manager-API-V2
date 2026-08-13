import { Context } from 'hono';

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
   return c.json(
      {
         error: 'INVALID_REQUEST_PARAMETERS',
         message: 'One or more request parameters are invalid.',
         details: result.error.issues
      },
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
   return c.json(
      {
         error: 'INVALID_REQUEST_JSON',
         message: 'One or more request fields are invalid.',
         details: result.error.issues
      },
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
   return c.json(
      {
         error: 'INVALID_REQUEST_QUERY',
         message: 'One or more of the queries is invalid.',
         details: result.error.issues
      },
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
