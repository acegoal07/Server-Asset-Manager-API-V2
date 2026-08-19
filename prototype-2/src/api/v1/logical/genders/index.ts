import { OpenAPIHono } from '@hono/zod-openapi';

import createGender from './controllers/createGender';
import addSubGenderToGender from './controllers/addSubGenderToGender';

export default new OpenAPIHono().route('/', addSubGenderToGender).route('/', createGender);
