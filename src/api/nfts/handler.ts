import { searchNFT } from '../../utils/elastic';
import { getAnimationURL } from '../../utils/nft';
import { search as dbSearch } from '../../utils/search';
import database from '../../database';
import { getIpfsFullURL } from '../../utils/ipfs';
const { parcel: Parcel } = database.models;

export async function search(ctx) {
  if (ctx.query.onSale) {
    ctx.query.onSale = ctx.query.onSale === '1' ? true : false;
  }
  try {
    const data = await searchNFT(ctx.query);
    ctx.status = 200;
    ctx.body = {
      count: data.hits.total.value,
      rows: await withData(data.hits.hits.map(r => formatNftResponse(r._source))),
    };
  } catch (e) {
    ctx.status = 500;
    ctx.body = { error: e.message };
  }
}

async function withData(rows) {
  return Promise.all(
    rows.map(async row => {
      const type = getType(row);
      switch (type) {
        case 'estate':
          row.data = {
            estate: {
              parcels: await Parcel.findAll({
                attributes: ['x', 'y'],
                where: { estateId: row.tokenId },
              }),
            },
          };
          break;
        default:
      }
      return row;
    })
  );
}

function getType(row) {
  const typeObj = row.traits!.find(t => t.name == 'type');
  return typeObj ? typeObj.value : null;
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
    rows: await withData(
      res.rows.map(r => {
        delete r.value;
        return formatNftResponse(r);
      })
    ),
  };
}
