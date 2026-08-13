import { Hono } from 'hono';

import getAssetById from './controllers/getAssetById';
import getAssets from './controllers/getAssets';
import createAsset from './controllers/createAsset';

export default new Hono().route('/:id', getAssetById).route('/', getAssets).route('/', createAsset);
