import { Hono } from 'hono';

import getAllGroups from './controllers/getAllGroups';
import createGroup from './controllers/createGroup';
import getGroupById from './controllers/getGroupById';

export default new Hono().route('/:id', getGroupById).route('/', getAllGroups).route('/', createGroup);
