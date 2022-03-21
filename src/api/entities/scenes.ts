import { Op } from 'sequelize';
import database from '../../database';
import { getParcelIdsFromPointers } from '../../utils/parcel';

const { scene: Scene, parcel: Parcel } = database.models;

function getPointersFromQuery(q) {
  if (!q.pointer) {
    return [];
  }

  return Array.isArray(q.pointer) ? q.pointer : [q.pointer];
}

export async function listScenes(ctx) {
  const pointers = getPointersFromQuery(ctx.query);
  if (pointers.length === 0) {
    ctx.body = [];
    return;
  }
  const parcelIds = getParcelIdsFromPointers(pointers);
  const scenes = await Scene.findAll({
    include: [
      {
        model: Parcel,
        required: true,
        attributes: [],
        where: { id: { [Op.in]: parcelIds } },
      },
    ],
  });

  ctx.body = scenes.map(scene => {
    return {
      id: scene.id,
      version: 'v3',
      type: 'scene',
      content: scene.contents,
      metadata: scene.metadata,
      pointers: scene.metadata.scene.parcels,
    };
  });
}
