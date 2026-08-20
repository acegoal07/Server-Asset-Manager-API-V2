import { OpenAPIHono } from '@hono/zod-openapi';

import getNodeByID from './controllers/getNodeByID';
import updateNode from './controllers/updateNode';

export default new OpenAPIHono().route('/:id', updateNode).route('/:id', getNodeByID);
