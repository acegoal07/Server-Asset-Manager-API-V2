import { OpenAPIHono } from '@hono/zod-openapi';

import createSubGender from './controllers/createSubGender';
import deleteSubGender from './controllers/deleteSubGender';

export default new OpenAPIHono().route('/:id', deleteSubGender).route('/', createSubGender);
