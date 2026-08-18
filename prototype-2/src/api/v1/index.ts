import { Hono } from 'hono';

import logical from './logical';
import physical from './physical';

export default new Hono()
   .route('/logical', logical)
   .route('/physical', physical);
