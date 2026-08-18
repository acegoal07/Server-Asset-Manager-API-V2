import { Prisma } from '@prisma/client';
import { assetSerializerArgs } from './includeSerializers';

export function serializeAsset(asset: Prisma.AssetsGetPayload<typeof assetSerializerArgs>) {
   return {
      id: asset.id,
      name: asset.name,
      notes: asset.notes,
      uSize: asset.uSize,
      uTop: asset.uTop,
      uBottom: asset.uBottom
   };
}
