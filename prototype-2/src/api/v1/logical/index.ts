import { Hono } from 'hono';

import domains from './domains';
import genders from './genders';
import subGenders from './subGenders';

export default new Hono()
   .route('/domains', domains)
   .route('/genders', genders)
   .route('/subgenders', subGenders);
