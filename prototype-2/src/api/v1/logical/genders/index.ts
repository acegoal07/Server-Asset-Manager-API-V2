import { OpenAPIHono } from '@hono/zod-openapi';

import createGender from './controllers/createGender';
import addSubGenderToGender from './controllers/addSubGenderToGender';
import deleteGender from './controllers/deleteGender';
import getGenderById from './controllers/getGenderById';

export default new OpenAPIHono()
   .route('/:id/subgender', addSubGenderToGender)
   .route('/:id', getGenderById)
   .route('/:id', deleteGender)
   .route('/', createGender);
