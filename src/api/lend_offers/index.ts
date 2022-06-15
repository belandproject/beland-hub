import database from '../../database';
import { buildQuery } from '../../utils/query';

const Offer = database.models.lend_offer;
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
      attributes: ['name', 'tokenId', "tokenAddress", 'creator', 'owner', 'imageUrl'],
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
  const query = buildQuery(ctx);

  const offers = await Offer.findAndCountAll({
    ...query,
    include,
  });
  ctx.status = 200;
  ctx.body = offers;
}

export default {
  list,
};
