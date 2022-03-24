import { Op } from 'sequelize';
import database from '../../database';
import { buildQuery } from '../../utils/query';
const { collection_item: Item, nft: NFT } = database.models;

function buildQueryType(where, ctx) {
  const itemType = ctx.request.query.string_type;
  if (!itemType) return;
  delete ctx.request.query.string_type;
  where.traits = {
    [Op.contains]: [
      {
        name: 'type',
        value: itemType,
      },
    ],
  };
  
}

function buildQueryOwnedByUser(include, ctx) {
  const { ownedByUser } = ctx.request.query;
  if (!ownedByUser) return;
  delete ctx.request.query.ownedByUser;
  include.push({
    model: NFT,
    where: {
      [Op.or]: {
        owner: ownedByUser,
        [Op.and]: {
          renter: ownedByUser,
          expiredAt: {
            [Op.gte]: new Date(),
          },
        },
      },
    },
  });
}

export async function handleList(ctx) {
  let where: any = {};
  let include: any[];
  buildQueryType(where, ctx);
  buildQueryOwnedByUser(include, ctx);
  const query = buildQuery(ctx);
  query.where = { ...query.where, ...where };
  query.include = include;
  const items = await Item.findAndCountAll(query);
  ctx.status = 200;
  ctx.body = items;
}
