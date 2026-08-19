import { OpenAPIHono } from '@hono/zod-openapi';

import domains from './domains';
import subGenders from './subGenders';
import primaryGenders from './primaryGenders';

export default new OpenAPIHono()
   .route('/domains', domains)
   .route('/genders', primaryGenders)
   .route('/subgenders', subGenders);
