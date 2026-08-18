import { OpenAPIHono } from '@hono/zod-openapi';

import createAsset from './controllers/createAsset';
import deleteAsset from './controllers/deleteAsset';
import getAllAssets from './controllers/getAllAssets';
import getAssetById from './controllers/getAssetById';
import updateAsset from './controllers/updateAsset';

export default new OpenAPIHono()
   .route('/', updateAsset)
   .route('/', getAssetById)
   .route('/', deleteAsset)
   .route('/', getAllAssets)
   .route('/', createAsset);
