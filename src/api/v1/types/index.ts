import { Hono } from 'hono';

import assets from './assets';
import storages from './storages';

export default new Hono().route('/assets', assets).route('/storages', storages);
