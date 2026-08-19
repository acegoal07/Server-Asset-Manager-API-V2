import { OpenAPIHono } from '@hono/zod-openapi';

import createDomain from './controllers/createDomain';
import updateDomain from './controllers/updateDomain';

export default new OpenAPIHono().route('/', createDomain).route('/', updateDomain);
