import { OpenAPIHono } from '@hono/zod-openapi';

import createPrimaryGender from './controllers/createPrimaryGender';
import deletePrimaryGender from './controllers/deletePrimaryGender';
import getPrimaryGenderById from './controllers/getPrimaryGenderByID';
import addSubGenderToPrimaryGender from './controllers/addSubGenderToPrimaryGender';
import getAllPrimaryGenders from './controllers/getAllPrimaryGenders';
import updatePrimaryGender from './controllers/updatePrimaryGender';
import removeSubGenderFromPrimaryGender from './controllers/removeSubGenderFromPrimaryGender';

export default new OpenAPIHono()
   .route('/all/:id', getAllPrimaryGenders)
   .route('/:id/sub/add', addSubGenderToPrimaryGender)
   .route('/:id/sub/remove', removeSubGenderFromPrimaryGender)
   .route('/:id', getPrimaryGenderById)
   .route('/:id', deletePrimaryGender)
   .route('/:id', updatePrimaryGender)
   .route('/', createPrimaryGender);
