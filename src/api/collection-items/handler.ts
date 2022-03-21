import database from '../../database';
import { buildQuery } from '../../utils/query';
const CollectionItem = database.models.collection_item;

export async function handleList(ctx) {
  const query = buildQuery(ctx);
  const items = await CollectionItem.findAndCountAll(query);
  ctx.status = 200;
  ctx.body = items;
}
