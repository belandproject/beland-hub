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
  ctx.body = formatListScenes(res);
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


const formatListScenes = (data) => {
  const rows = [];
  for (let i = 0 ;i < data.rows.length; i ++) {
    let row: any= data.rows[i].toJSON();
    if (row.parcels) {
      row.pointers = row.parcels.map(parcel => {
        const xy = getPointerFromID(parcel.id)
        return `${xy.x},${xy.y}`
      })
      delete row.parcels;
    }
    rows.push(row)
  }
  return {
    count: data.count,
    rows,
  }
}
