import { Hono } from 'hono';

import docs from './docs';

export default new Hono().route('/docs', docs);
