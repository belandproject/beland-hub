import { Op } from 'sequelize';
import database from '../../database';
import { getPointerFromID } from '../../mods/nft/mappings/utils';
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
  res.rows = res.rows.map(row => {
    row.pointers = row.parcels.map(parcel => {
      return getPointerFromID(parcel.id)
    })
    delete row.parcels;
    return row;
  })
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
    attributes: ['id'],
    where: { id: { [Op.in]: parcelIds } },
  });
}
