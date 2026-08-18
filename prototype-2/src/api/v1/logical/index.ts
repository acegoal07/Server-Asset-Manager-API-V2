import { OpenAPIHono } from '@hono/zod-openapi';
import domains from './domains';
import genders from './genders';
import subGenders from './subGenders';

export default new OpenAPIHono()
   .route('/domains', domains)
   .route('/genders', genders)
   .route('/subgenders', subGenders);
