import { OpenAPIHono } from '@hono/zod-openapi';

import createDomain from './controllers/createDomain';
import deleteDomain from './controllers/deleteDomain';

export default new OpenAPIHono().route('/:id', deleteDomain).route('/', createDomain);
