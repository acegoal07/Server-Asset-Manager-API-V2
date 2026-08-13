import { Hono } from 'hono';

export default new Hono()
   .route('/assets', (await import('./assets')).default)
   .route('/groups', (await import('./groups')).default)
   .route('/storages', (await import('./storages')).default)
   .route('/storages', (await import('./types')).default);
