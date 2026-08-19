import { OpenAPIHono } from '@hono/zod-openapi';

import createPrimaryGender from './controllers/createPrimaryGender';
import deletePrimaryGender from './controllers/deletePrimaryGender';
import getPrimaryGenderById from './controllers/getPrimaryGenderById';
import addSubGenderToPrimaryGender from './controllers/addSubGenderToPrimaryGender';
import getAllPrimaryGenders from './controllers/getAllPrimaryGenders';
import updatePrimaryGender from './controllers/updatePrimaryGender';
import getNodeByName from './controllers/getNodeByName';

export default new OpenAPIHono()
   .route('/all/:id', getAllPrimaryGenders)
   .route('/:id/subgender', addSubGenderToPrimaryGender)
   .route('/:id/node/:name', getNodeByName)
   .route('/:id', getPrimaryGenderById)
   .route('/:id', deletePrimaryGender)
   .route('/:id', updatePrimaryGender)
   .route('/', createPrimaryGender);
