import { Hono } from 'hono';

import getAssetById from './controllers/getAssetById';
import getAssets from './controllers/getAssets';
import createAsset from './controllers/createAsset';
import deleteAsset from './controllers/deleteAsset';

export default new Hono()
   .route('/:id', getAssetById)
   .route('/:id', deleteAsset)
   .route('/', getAssets)
   .route('/', createAsset);
