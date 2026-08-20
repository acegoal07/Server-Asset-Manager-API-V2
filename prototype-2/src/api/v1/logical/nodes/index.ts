import { OpenAPIHono } from '@hono/zod-openapi';

import getNodeByID from './controllers/getNodeByID';

export default new OpenAPIHono().route('/:id', getNodeByID);
