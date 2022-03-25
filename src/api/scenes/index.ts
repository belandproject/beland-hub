import { Op } from 'sequelize';
import database from '../../database';
import { getParcelIdsFromPointers } from '../../utils/parcel';
import { buildQuery } from '../../utils/query';
const { scene: Scene, parcel: Parcel } = database.models;

export async function listScenes(ctx) {
  let includes = [];
  buildQueryPointer(includes, ctx);
  const query = buildQuery(ctx);
  query.include = includes;
  const res = await Scene.findAndCountAll(query);
  ctx.status = 200;
  ctx.body = res;
}

function getPointers(pointers) {
  if (!pointers) return [];
  return Array.isArray(pointers) ? pointers : [pointers];
}

function buildQueryPointer(includes, ctx) {
  const pointers = getPointers(ctx.query.pointers);
  if (pointers.length === 0) {
    return;
  }
  delete ctx.query.pointers;
  const parcelIds = getParcelIdsFromPointers(pointers);
  includes.push({
    model: Parcel,
    required: true,
    attributes: [],
    where: { id: { [Op.in]: parcelIds } },
  });
}
