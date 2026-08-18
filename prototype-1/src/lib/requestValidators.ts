import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import {
   invalidJsonRequestError,
   invalidParametersRequestError,
   invalidQueryRequestError
} from './errorMessages';

/**
 * Used to validate the param request input
 * @param validator
 * @returns
 */
export const requestParamValidator = <T extends z.ZodType>(validator: T) =>
   zValidator('param', validator, (result, c) => {
      if (!result.success) {
         return invalidParametersRequestError(c, result);
      }
   });

/**
 * Used to validate the json request input
 * @param validator
 * @returns
 */
export const requestJsonValidator = <T extends z.ZodType>(validator: T) =>
   zValidator('json', validator, (result, c) => {
      if (!result.success) {
         return invalidJsonRequestError(c, result);
      }
   });

/**
 * Used to validate the query request input
 * @param validator
 * @returns
 */
export const requestQueryValidator = <T extends z.ZodType>(validator: T) =>
   zValidator('query', validator, (result, c) => {
      if (!result.success) {
         return invalidQueryRequestError(c, result);
      }
   });

/**
 * Used to validate the ids in a query
 * @param extra
 * @returns
 */
export const requestIdValidator = <T extends z.ZodRawShape>(extra: T = {} as T) => {
   return requestParamValidator(
      z.object({
         id: z.coerce
            .number({ error: 'ID must be a number' })
            .int({ error: 'ID must be a whole number' })
            .positive({ error: 'ID must be greater than 0' }),
         ...extra
      })
   );
};
