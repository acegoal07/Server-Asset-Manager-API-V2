import { Hono } from 'hono';
import { z } from 'zod';

import { requestIdValidator, requestJsonValidator } from '../../../../../lib/requestValidators';

export default new Hono().post(
   '/',
   requestIdValidator({}),
   requestJsonValidator(
      z.object({
         subGenderID: z
            .number({ error: 'Sub gender ID must be a number' })
            .int({ error: 'Sub gender ID must be an integer' })
            .positive({ error: 'Sub gender ID must be greater than 0' })
      })
   ),
   async (c) => {
      // Get request information
      const { id } = c.req.valid('param');
      const body = c.req.valid('json');

      // Link the sub gender to the primary gender
   }
);
