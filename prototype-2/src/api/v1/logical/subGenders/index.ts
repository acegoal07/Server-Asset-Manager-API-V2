import { Hono } from 'hono';

import createSubGender from './controllers/createSubGender';

export default new Hono().route('/', createSubGender);
