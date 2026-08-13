import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';

export default new Hono().get('/', async (c) => {
   const groups = await prisma.groups.findMany({
      orderBy: {
         id: 'asc'
      }
   });

   return c.json(groups.map(serializeGroup));
});
