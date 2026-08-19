import { OpenAPIHono } from '@hono/zod-openapi';

import createDomain from './controllers/createDomain';
import updateDomain from './controllers/updateDomain';
import deleteDomain from './controllers/deleteDomain';
import getDomainById from './controllers/getDomainByID';
import getAllDomains from './controllers/getAllDomains';

export default new OpenAPIHono()
   .route('/:id', deleteDomain)
   .route('/:id', updateDomain)
   .route('/:id', getDomainById)
   .route('/', getAllDomains)
   .route('/', createDomain);
