import database from '../../database';
import { buildQuery } from '../../utils/query';

const Scene = database.models.scene;
export async function listScenes(ctx) {
  const query = buildQuery(ctx);
  const items = await Scene.findAndCountAll(query);
  ctx.status = 200;
  ctx.body = items;
}
