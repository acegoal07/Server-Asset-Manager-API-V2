import { Hono } from 'hono';

import getAllTypes from './controllers/getAllTypes';
import getTypeById from './controllers/getTypeById';
import createType from './controllers/createType';

export default new Hono().route('/:id', getTypeById).route('/', createType).route('/', getAllTypes);
