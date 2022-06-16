import { Op } from 'sequelize';
import database from '../../database';
import { getItemFilterOptions, searchItem } from '../../utils/elastic';
import { getIpfsFullURL } from '../../utils/ipfs';
import { getAnimationURL } from '../../utils/nft';
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
  ctx.status = 200;
  ctx.body = await Item.findAndCountAll(query);
}

export async function handleSearch(ctx) {
  const res = await searchItem(ctx.query);
  ctx.body = {
    count: res.hits.total.value,
    rows: res.hits.hits.map(r => formatItemResponse(r._source)),
  };
}

function formatItemResponse(item) {
  item.imageUrl = getIpfsFullURL(item.imageUrl);
  item.animationUrl = `https://wearable-preview.beland.io/?contract=${item.tokenAddress}&item=${item.itemId}`;
  return item;
}

export async function handleGetFilterOptions(ctx) {
  ctx.body = await getItemFilterOptions(ctx.query);
}