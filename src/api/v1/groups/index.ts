import { Hono } from 'hono';

import getAllGroups from './controllers/getAllGroups';
import createGroup from './controllers/createGroup';
import getGroupById from './controllers/getGroupById';
import updateGroup from './controllers/updateGroup';
import extendGroup from './controllers/extendGroup';
import initialiseGroupNodes from './controllers/initialiseGroupNodes';
import getAvailableGroupNames from './controllers/getAvailableGroupNames';

export default new Hono()
   .route('/initialise', initialiseGroupNodes)
   .route('/:id/extend', extendGroup)
   .route('/:id/names', getAvailableGroupNames)
   .route('/:id', updateGroup)
   .route('/:id', getGroupById)
   .route('/', getAllGroups)
   .route('/', createGroup);
