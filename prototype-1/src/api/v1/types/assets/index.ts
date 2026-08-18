import { Hono } from 'hono';

import getAllTypes from './controllers/getAllTypes';
import getTypeById from './controllers/getTypeById';
import createType from './controllers/createType';
import updateType from './controllers/updateType';

export default new Hono()
   .route('/:id', getTypeById)
   .route('/:id', updateType)
   .route('/', createType)
   .route('/', getAllTypes);
