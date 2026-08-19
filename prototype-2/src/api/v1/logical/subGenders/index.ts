import { OpenAPIHono } from '@hono/zod-openapi';

import createSubGender from './controllers/createSubGender';
import deleteSubGender from './controllers/deleteSubGender';
import getSubGenderByID from './controllers/getSubGenderByID';
import getAllSubGenders from './controllers/getAllSubGenders';

export default new OpenAPIHono()
   .route('/domains/:id', getAllSubGenders)
   .route('/:id', deleteSubGender)
   .route('/:id', getSubGenderByID)
   .route('/', createSubGender);
