import { OpenAPIHono } from '@hono/zod-openapi';

import createDomain from './controllers/createDomain';

export default new OpenAPIHono().route('/', createDomain);
