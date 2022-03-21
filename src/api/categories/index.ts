import database from '../../database';
import { buildQuery } from '../../utils/query';

const Category = database.models.category;

async function get(ctx) {
  const col = await Category.findByPk(ctx.params.id);
  if (!col) {
    ctx.status = 404;
    ctx.message = 'Category not found';
    return;
  }
  ctx.body = col;
}

async function list(ctx) {
  const query = buildQuery(ctx);
  const cols = await Category.findAndCountAll({
    ...query,
  });
  ctx.status = 200;
  ctx.body = cols;
}

export default {
  get,
  list,
};
