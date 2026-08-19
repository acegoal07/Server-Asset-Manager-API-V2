import { OpenAPIHono } from '@hono/zod-openapi';

import createPrimaryGender from './controllers/createPrimaryGender';
import deletePrimaryGender from './controllers/deletePrimaryGender';
import getPrimaryGenderById from './controllers/getPrimaryGenderById';
import addSubGenderToPrimaryGender from './controllers/addSubGenderToPrimaryGender';
import getAllPrimaryGenders from './controllers/getAllPrimaryGenders';

export default new OpenAPIHono()
   .route('/domains/:id', getAllPrimaryGenders)
   .route('/:id/subgender', addSubGenderToPrimaryGender)
   .route('/:id', getPrimaryGenderById)
   .route('/:id', deletePrimaryGender)
   .route('/', createPrimaryGender);
