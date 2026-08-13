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
export const requestParamValidator = <T extends z.ZodTypeAny>(validator: T) =>
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
export const requestJsonValidator = <T extends z.ZodTypeAny>(validator: T) =>
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
export const requestQueryValidator = <T extends z.ZodTypeAny>(validator: T) =>
   zValidator('query', validator, (result, c) => {
      if (!result.success) {
         return invalidQueryRequestError(c, result);
      }
   });

/**
 * Used to validate the ids in a query
 * @returns
 */
export const requestIdValidator = requestParamValidator(
   z.object({
      id: z.number('ID must be a number').int('ID must be an int').positive('ID must be positive')
   })
);
