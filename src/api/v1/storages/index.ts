import { Hono } from 'hono';

import getStorageById from './controllers/getStorageById';
import getStorages from './controllers/getAllStorages';
import createStorage from './controllers/createStorage';
import updateStorage from './controllers/updateStorage';
import deleteStorage from './controllers/deleteStorage';

export default new Hono()
   .route('/:id', getStorageById)
   .route('/:id', updateStorage)
   .route('/:id', deleteStorage)
   .route('/', getStorages)
   .route('/', createStorage);
