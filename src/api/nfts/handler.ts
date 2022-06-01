import { search as esSearch } from '../../utils/elastic';
import { getAnimationURL, getIpfsFullURL } from '../../utils/nft';
import { search as dbSearch } from '../../utils/search';

export async function search(ctx) {
  if (ctx.query.onSale) {
    ctx.query.onSale = ctx.query.onSale === '1' ? true : false;
  }
  try {
    const data = await esSearch(ctx.query);
    ctx.status = 200;
    ctx.body = {
      count: data.hits.total.value,
      rows: data.hits.hits.map(r => formatNftResponse(r._source)),
    };
  } catch (e) {
    ctx.status = 500;
    ctx.body = { error: e.message };
  }
}

function formatNftResponse(nft) {
  nft.imageUrl = getIpfsFullURL(nft.imageUrl);
  nft.animationUrl = getAnimationURL(nft);
  return nft;
}

export async function list(ctx) {
  const res = await dbSearch(ctx.query, {
    table: 'nfts',
  });
  ctx.status = 200;
  ctx.body = {
    count: res.count,
    rows: res.rows.map(r => {
      delete r.value;
      return formatNftResponse(r);
    }),
  };
}
