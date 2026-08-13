import { Hono } from 'hono';

import assets from './assets';
import groups from './groups';
import storages from './storages';
import types from './types';

export default new Hono()
   .route('/assets', assets)
   .route('/groups', groups)
   .route('/storages', storages)
   .route('/types', types);
