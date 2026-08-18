import { OpenAPIHono } from '@hono/zod-openapi';

import assets from './assets';

export default new OpenAPIHono().route('/assets', assets);
