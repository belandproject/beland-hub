import { Op } from 'sequelize';
import database from '../../database';

const { collection_item: Item } = database.models;
export async function listItems(ctx) {
  const where: any = {};
  if (ctx.query.collectionId) {
    where.tokenAddress = ctx.query.collectionId;
  }

  if (ctx.query.id) {
    where.id = ctx.query.id;
  }

  where.traits = {
    [Op.contains]: [
      {
        name: 'type',
        value: 'item',
      },
    ],
  };

  ctx.body = await Item.findAndCountAll({
    where,
  });
}
