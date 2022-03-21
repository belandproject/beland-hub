import { search } from '../../elastic';
import database from '../../database';
import { syncMetadata } from '../../utils/metadata';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../constants';
import sequelize from '../../database';
import { QueryTypes } from 'sequelize';
const NFT = database.models.nft;

export async function searchNFT(ctx) {
  if (ctx.query.onSale) {
    ctx.query.onSale = ctx.query.onSale === '1' ? true : false;
  }

  try {
    const data = await search(ctx.query);

    ctx.status = 200;
    ctx.body = {
      count: data.hits.total.value,
      rows: data.hits.hits.map(r => {
        r = r._source;
        r.properties = r.properties || [];
        return r;
      }),
    };
  } catch (e) {
    ctx.status = 500;
  }
}

export async function list(ctx) {
  const { queryStr, replacements, queryCount } = buildQueryFilters(ctx.query);
  const rows = await sequelize.query(queryStr, {
    type: QueryTypes.SELECT,
    replacements,
  });
  // console.log(queryStr, replacements)
  const count = await sequelize.query(queryCount, {
    type: QueryTypes.SELECT,
    replacements,
  });
  ctx.status = 200;
  ctx.body = {
    count: Number(count[0].count),
    rows: rows.map(r => {
      delete r.value;
      return r;
    }),
  };
}

export async function syncMeta(ctx) {
  try {
    ctx.body = await syncMetadata(ctx.params.id);
  } catch (err) {
    ctx.body = {
      error: {
        message: err.message,
      },
    };
    ctx.status = 500;
  }
}

function getCondition(op: string): string {
  switch (op) {
    case 'gte':
      return '>=';
    case 'lte':
      return '<=';
    case 'gt':
      return '>';
    case 'lt':
      return '<';
    case 'in':
      return 'in';
    case 'notIn':
      return 'not in';
    default:
      return '=';
  }
}

function buildQueryFilters(params) {
  const limit = params.limit || DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) {
    throw Error('limit must be less than ' + MAX_LIMIT);
  }

  let orderDirection = 'desc';
  if (params.orderDirection === 'asc') {
    orderDirection = 'asc';
  }

  let orderBy = params.orderBy || 'id';
  let offset = params.offset || 0;

  if (!NFT.rawAttributes[orderBy]) {
    throw Error('invalid attribute');
  }

  delete params.orderDirection;
  delete params.limit;
  delete params.orderBy;
  delete params.offset;
  let whereAnd = [];
  let replacements = [];
  let hasQueryTrait = false;
  for (let paramKey in params) {
    if (paramKey.startsWith('int_')) {
      hasQueryTrait = true;
      let _paramKeyArr = paramKey.replace('int_', '').split('__');
      let condition = getCondition(_paramKeyArr.length > 1 ? _paramKeyArr[1] : '');
      replacements.push(_paramKeyArr[0]);
      if (_paramKeyArr.length > 0 && _paramKeyArr[1] == 'in') {
        whereAnd.push(`attr->>'name'=? and (attr->>'intValue')::numeric in (?)`);
        replacements.push(params[paramKey].split(','));
      } else {
        replacements.push(params[paramKey]);
        whereAnd.push(`attr->>'name'=? and (attr->>'intValue')::numeric ${condition} ?`);
      }
    } else if (paramKey.startsWith('string_')) {
      hasQueryTrait = true;
      let _paramKeyArr = paramKey.replace('string_', '').split('__');
      replacements.push(_paramKeyArr[0]);
      let condition = getCondition(_paramKeyArr.length > 1 ? _paramKeyArr[1] : '');
      if (_paramKeyArr.length > 0 && _paramKeyArr[1] == 'in') {
        whereAnd.push(`attr->>'name'=? and (attr->>'value')::text ${condition} (?)`);
        replacements.push(params[paramKey].split(','));
      } else {
        whereAnd.push(`attr->>'name'=? and (attr->>'value')::text ${condition} ?`);
        replacements.push(params[paramKey]);
      }
    } else if (paramKey === 'q') {
      whereAnd.push(`name ilike ?`);
      replacements.push(`%${params[paramKey]}%`);
    } else {
      let _paramKeyArr = paramKey.split('__');
      let condition = getCondition(_paramKeyArr.length > 1 ? _paramKeyArr[1] : '');
      if (!NFT.rawAttributes[_paramKeyArr[0]]) {
        throw Error('invalid attribute');
      }
      if (_paramKeyArr.length > 0 && _paramKeyArr[1] == 'in') {
        whereAnd.push(`"${_paramKeyArr[0]}" in (?)`);
        replacements.push(params[paramKey].split(','));
      } else {
        whereAnd.push(`"${_paramKeyArr[0]}" ${condition} ?`);
        replacements.push(params[paramKey]);
      }
    }
  }
  let where = '';
  let from = 'nfts';
  if (whereAnd.length > 0) {
    where = `WHERE ${whereAnd.join(' AND ')}`;
    if (hasQueryTrait) {
      from = 'nfts,jsonb_array_elements(traits) attr';
    }
  }
  replacements.push(limit);
  replacements.push(offset);
  return {
    queryCount: `SELECT count(id) FROM ${from} ${where}`,
    queryStr: `SELECT * FROM ${from} ${where} ORDER BY "${orderBy}" ${orderDirection} LIMIT ? OFFSET ?`,
    replacements,
  };
}
