import { OpenAPIHono } from '@hono/zod-openapi';

import createAsset from './controllers/createAsset';
import deleteAsset from './controllers/deleteAsset';
import getAllAssets from './controllers/getAllAssets';
import getAssetById from './controllers/getAssetByID';
import updateAsset from './controllers/updateAsset';

export default new OpenAPIHono()
   .route('/:id', updateAsset)
   .route('/:id', getAssetById)
   .route('/:id', deleteAsset)
   .route('/', getAllAssets)
   .route('/', createAsset);
