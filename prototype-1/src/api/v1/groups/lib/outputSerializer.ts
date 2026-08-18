import { Prisma } from '@prisma/client';

export function serializeGroup(group: Prisma.GroupsGetPayload<Prisma.GroupsDefaultArgs>) {
   return {
      id: group.id,
      name: group.name,
      size: group.size,
      ipMask: group.ipMask,
      nameMask: group.nameMask
   };
}
