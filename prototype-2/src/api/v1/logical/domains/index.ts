import { Hono } from 'hono';

import createDomain from './controllers/createDomain';

export default new Hono().route('/', createDomain);
