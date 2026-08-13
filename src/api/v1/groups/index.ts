import { Hono } from 'hono';

import getAllGroups from './controllers/getAllGroups';
import createGroup from './controllers/createGroup';
import getGroupById from './controllers/getGroupById';
import updateGroup from './controllers/updateGroup';
import extendGroup from './controllers/extendGroup';

export default new Hono()
   .route('/initialise')
   .route('/:id/extend', extendGroup)
   .route('/:id', updateGroup)
   .route('/:id', getGroupById)
   .route('/', getAllGroups)
   .route('/', createGroup);
