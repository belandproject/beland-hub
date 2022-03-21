import database from '../../database';
import { buildQuery } from '../../utils/query';

const Estate = database.models.estate;

export async function listEstate(ctx) {
  const query = buildQuery(ctx);
  const items = await Estate.findAndCountAll(query);
  ctx.status = 200;
  ctx.body = items;
}
