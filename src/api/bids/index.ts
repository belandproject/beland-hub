import database from '../../database';
import { buildQuery } from '../../utils/query';

const Bid = database.models.bid;
const Nft = database.models.nft;
const User = database.models.user;

async function list(ctx) {
  const nftWhere: any = {};
  const include = [];
  if (ctx.query.seller) {
    nftWhere.owner = ctx.query.seller;
    delete ctx.query.seller;
  }

  if (ctx.query.include && ctx.query.include.includes('nft')) {
    include.push({
      model: Nft,
      as: 'nft',
      where: nftWhere,
      attributes: ['id', 'name', 'imageUrl'],
      include: [
        {
          model: User,
          attributes: ['name', 'avatar', 'website'],
          as: 'creatorInfo',
        },
      ],
    });
    delete ctx.query.include;
  }

  if (ctx.query.toggles && ctx.query.toggles == "ON_SALE") {
    ctx.query.onSale = 1;
    delete ctx.query.toggles;
  }

  const query = buildQuery(ctx);

  const nfts = await Bid.findAndCountAll({
    ...query,
    include,
  });
  ctx.status = 200;
  ctx.body = nfts;
}

export default {
  list,
};
