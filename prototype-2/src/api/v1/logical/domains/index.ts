import { OpenAPIHono } from '@hono/zod-openapi';

import createDomain from './controllers/createDomain';
import updateDomain from './controllers/updateDomain';
import deleteDomain from './controllers/deleteDomain';
import getDomainById from './controllers/getDomainById';

export default new OpenAPIHono()
   .route('/:id', deleteDomain)
   .route('/:id', updateDomain)
   .route('/:id', getDomainById)
   .route('/', createDomain);
