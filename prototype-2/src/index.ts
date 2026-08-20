// LOAD ENV FILE
import 'dotenv/config';

// CREATE HONO
import { OpenAPIHono } from '@hono/zod-openapi';
const hono = new OpenAPIHono();

// LOAD MIDDLEWARE
import { trimTrailingSlash } from 'hono/trailing-slash';
hono.use('*', trimTrailingSlash());

import { compress } from 'hono/compress';
hono.use('*', compress());

import { debugLogger } from './middleware/debugLogger';
hono.use('*', debugLogger);

import { cors } from 'hono/cors';
hono.use(
   '*',
   cors({
      allowMethods: ['POST', 'GET', 'DELETE', 'PATCH', 'OPTIONS']
   })
);

// LOAD ENDPOINTS
import v1 from './api/v1';
hono.route('/api/v1', v1);

// CREATE VERSIONED DOCS
hono.get('/api/v1/openapi.json', (c) => {
   return c.json(
      v1.getOpenAPI31Document({
         openapi: '3.1.0',
         info: {
            title: 'My API',
            version: '1.0.0'
         },
         servers: [
            {
               url: '/api/v1'
            }
         ],
         'x-tagGroups': [
            {
               name: 'Physical',
               tags: ['Assets']
            },
            {
               name: 'Logical',
               tags: ['Domains', 'Nodes', 'Primary Genders', 'Sub Genders']
            }
         ]
      })
   );
});

// HOST VERSIONED DOCS
import { Scalar } from '@scalar/hono-api-reference';
hono.get(
   '/api/v1/docs',
   Scalar({
      url: '/api/v1/openapi.json'
   })
);

// HANDLE UNCAUGHT ERRORS
import { internalServerError } from './lib/errorMessages';
hono.onError((err, c) => internalServerError(c, err));

// 404 ERROR
hono.notFound((c) =>
   c.json(
      {
         error: 'Not Found',
         message: `You've almost made it to V5 some how. Like DJ Khaled said once "another one"`
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
