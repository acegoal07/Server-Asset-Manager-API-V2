import { OpenAPIHono } from '@hono/zod-openapi';

import createSubGender from './controllers/createSubGender';
import deleteSubGender from './controllers/deleteSubGender';
import getSubGenderByID from './controllers/getSubGenderByID';
import getAllSubGenders from './controllers/getAllSubGenders';
import updateSubGender from './controllers/updateSubGender';

export default new OpenAPIHono()
   .route('/all/:id', getAllSubGenders)
   .route('/:id', deleteSubGender)
   .route('/:id', getSubGenderByID)
   .route('/', updateSubGender)
   .route('/', createSubGender);
