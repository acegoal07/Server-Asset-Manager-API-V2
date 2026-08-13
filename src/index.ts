// LOAD ENV FILE
import 'dotenv/config';

// CREATE HONO
const hono = new (await import('hono')).Hono();

// LOAD MIDDLEWARE
hono.use('*', (await import('hono/trailing-slash')).trimTrailingSlash());
hono.use('*', (await import('hono/compress')).compress());
hono.use(
   '*',
   (await import('hono/cors')).cors({
      allowMethods: ['POST', 'GET', 'DELETE', 'PATCH', 'PUT', 'OPTIONS']
   })
);

// LOAD ENDPOINTS
hono.route('/api/v1', (await import('./api/v1')).default);

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
(await import('@hono/node-server')).serve({
   fetch: hono.fetch,
   port: Number(process.env.PORT) || 3000
});
