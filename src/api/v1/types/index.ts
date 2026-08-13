import { Hono } from 'hono';

export default new Hono()
   .route('/assets', (await import('./assets')).default)
   .route('/storages', (await import('./storages')).default);
