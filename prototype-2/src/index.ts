// LOAD ENV FILE
import 'dotenv/config';

// CREATE HONO
import { Hono } from 'hono';
const hono = new Hono();

// LOAD MIDDLEWARE
hono.use('*', (await import('hono/trailing-slash')).trimTrailingSlash());
hono.use('*', (await import('hono/compress')).compress());

import { debugLogger } from './middleware/debugLogger';
hono.use('*', debugLogger);

import { cors } from 'hono/cors';
hono.use(
   '*',
   cors({
      allowMethods: ['POST', 'GET', 'DELETE', 'PATCH', 'PUT', 'OPTIONS']
   })
);

// LOAD ENDPOINTS
import v1 from './api/v1';
hono.route('/api/v1', v1);

// HANDLE UNCAUGHT ERRORS
import { internalServerError } from './lib/errorMessages';
hono.onError((err, c) => internalServerError(c, err));

// 404 ERROR
hono.notFound((c) =>
   c.json(
      {
         error: 'Not Found',
         message: `You've almost made it to V4, if there is supposed to be something here let Alex or Oscar know it might be broken :)`
      },
      404
   )
);

// START UP SERVER
import { serve } from '@hono/node-server';
serve({
   fetch: hono.fetch,
   port: Number(process.env.PORT) || 3000
});
