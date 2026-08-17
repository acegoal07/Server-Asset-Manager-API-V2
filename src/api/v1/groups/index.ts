import { Hono } from 'hono';

import getAllGroups from './controllers/getAllGroups';
import createGroup from './controllers/createGroup';
import getGroupById from './controllers/getGroupById';
import updateGroup from './controllers/updateGroup';
import extendGroup from './controllers/extendGroup';
import initialiseGroupNodes from './controllers/initialiseGroupNodes';
import getAvailableGroupNames from './controllers/getAvailableGroupNames';
import getGroupNodeByUUID from './controllers/getGroupNodeByUUID';
import deleteGroup from './controllers/deleteGroup';

export default new Hono()
   .route('/:id/whoami/:uuid', getGroupNodeByUUID)
   .route('/:id/extend', extendGroup)
   .route('/:id/initialize', initialiseGroupNodes)
   .route('/:id/names', getAvailableGroupNames)
   .route('/:id', updateGroup)
   .route('/:id', getGroupById)
   .route('/:id', deleteGroup)
   .route('/', getAllGroups)
   .route('/', createGroup);
