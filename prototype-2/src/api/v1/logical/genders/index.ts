import { Hono } from 'hono';

import createGender from './controllers/createGender';

export default new Hono()
   .route('/', createGender);
