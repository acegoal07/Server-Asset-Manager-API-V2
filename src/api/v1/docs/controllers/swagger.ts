import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

export default new Hono().get(
   '/',
   swaggerUI({
      url: '/api/v1/docs/openapi.json'
   })
);
