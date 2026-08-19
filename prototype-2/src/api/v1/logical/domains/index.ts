import { OpenAPIHono } from '@hono/zod-openapi';

import createDomain from './controllers/createDomain';
import updateDomain from './controllers/updateDomain';
import deleteDomain from './controllers/deleteDomain';

export default new OpenAPIHono()
   .route('/:id', deleteDomain)
   .route('/:id', updateDomain)
   .route('/', createDomain).route;
