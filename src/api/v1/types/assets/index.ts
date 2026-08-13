import { Hono } from 'hono';

import getAllTypes from './controllers/getAllTypes';
import getTypeById from './controllers/getTypeById';

export default new Hono().route('/:id', getTypeById).route('/', getAllTypes);
