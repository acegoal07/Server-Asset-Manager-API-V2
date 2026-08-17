import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { serializeGroup } from '../lib/outputSerializer';
import { internalServerError } from '../../../../lib/errorMessages';

export default new Hono().get('/', async (c) => {
   try {
      const groups = await prisma.groups.findMany({
         orderBy: {
            id: 'asc'
         }
      });

      return c.json(groups.map(serializeGroup));
   } catch (err) {
      return internalServerError(c, err);
   }
});
