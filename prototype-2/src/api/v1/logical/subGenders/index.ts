import { OpenAPIHono } from '@hono/zod-openapi';

import createSubGender from './controllers/createSubGender';

export default new OpenAPIHono().route('/', createSubGender);
