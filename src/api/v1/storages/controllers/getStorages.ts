import { Hono } from 'hono';

import { prisma } from '../../../../lib/prisma';
import { storageSerializerArgs, serializeStorage } from '../lib/serialisers';
import { storageQueryValidator } from '../lib/validators';

export default new Hono().get('/', storageQueryValidator, async (c) => {
   const query = c.req.valid('query');

   const storages = await prisma.storages.findMany({
      ...storageSerializerArgs,

      where: {
         ...(query.typeId !== undefined && {
            storageTypeId: query.typeId
         }),

         ...(query.type !== undefined && {
            StorageTypes: {
               name: query.type
            }
         })
      }
   });

   return c.json(storages.map(serializeStorage));
});
