import database from '../../database';
import { buildQuery } from '../../utils/query';

const Parcel = database.models.parcel;

export async function listParcel(ctx) {
  const query = buildQuery(ctx);
  const items = await Parcel.findAndCountAll(query);
  ctx.status = 200;
  ctx.body = items;
}
