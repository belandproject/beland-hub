import { Op } from 'sequelize';
import database from '../../database';
import { getIpfsFullURL } from '../../utils/nft';
import { buildQuery } from '../../utils/query';
import { search as dbSearch } from '../../utils/search';

const { item: Item, nft: NFT } = database.models;

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

function buildQueryToggle(where, ctx) {
  if (ctx.query.toggles && ctx.query.toggles.includes('ON_SALE')) {
    where.onSale = true;
  }
  delete ctx.query.toggles;
}

export async function handleList(ctx) {
  let where: any = {};
  let include: any[] = [];
  buildQueryType(where, ctx);
  buildQueryOwnedByUser(include, ctx);
  buildQueryToggle(where, ctx);
  const query = buildQuery(ctx);
  query.where = { ...query.where, ...where };
  query.include = include;
  const items = await Item.findAndCountAll(query);
  ctx.status = 200;
  ctx.body = formatItems(items);
}

export async function handleSearch(ctx) {
  ctx.body = await dbSearch(ctx.query, {
    table: 'items',
  });
}




function formatItems(rows) {
  return rows.map(row => {
    row.imageUrl = getIpfsFullURL(row.imageUrl)
    return row;
  })
}