import database from '../../database';
import { buildQuery } from '../../utils/query';

const Collection = database.models.collection;

export async function handleGet(ctx) {
  const col = await Collection.findByPk(ctx.params.id);
  if (!col) {
    ctx.status = 404;
    ctx.message = 'Collection not found';
    return;
  }
  ctx.body = col;
}

export async function handleList(ctx) {
  const query = buildQuery(ctx);
  const cols = await Collection.findAndCountAll({
    ...query,
  });
  ctx.status = 200;
  ctx.body = cols;
}

export async function handleCreate(ctx) {
  const col = Collection.build(ctx.request.body);
  await col.save();
  ctx.body = col;
}

export async function handleUpdate(ctx) {
  ctx.state.col.setAttributes(ctx.request.body);
  await ctx.state.col.save();
  ctx.body = ctx.state.col;
}

export async function handleDelete(ctx) {
  await ctx.state.col.destroy();
  ctx.body = ctx.state.col;
}
