import { Hono } from 'hono';
import getTypesById from './controllers/getTypesById';
import getTypes from './controllers/getTypes';
import createType from './controllers/createType';

export default new Hono().route('/:id', getTypesById).route('/', getTypes).route('/', createType);
