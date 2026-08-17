import { Hono } from 'hono';

import getAssetById from './controllers/getAssetById';
import getAssets from './controllers/getAssets';
import createAsset from './controllers/createAsset';
import deleteAsset from './controllers/deleteAsset';
import updateAsset from './controllers/updateAsset';

export default new Hono()
   .route('/:id', getAssetById)
   .route('/:id', deleteAsset)
   .route('/:id', updateAsset)
   .route('/', getAssets)
   .route('/', createAsset);
