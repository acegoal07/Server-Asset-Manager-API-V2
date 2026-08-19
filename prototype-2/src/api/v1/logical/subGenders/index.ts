import { OpenAPIHono } from '@hono/zod-openapi';

import createSubGender from './controllers/createSubGender';
import deleteSubGender from './controllers/deleteSubGender';
import getSubGenderByID from './controllers/getSubGenderByID';

export default new OpenAPIHono()
   .route('/:id', deleteSubGender)
   .route('/:id', getSubGenderByID)
   .route('/', createSubGender);
