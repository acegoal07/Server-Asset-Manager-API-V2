import { OpenAPIHono } from '@hono/zod-openapi';

import logical from './logical';
import physical from './physical';

export default new OpenAPIHono().route('/logical', logical).route('/physical', physical);
