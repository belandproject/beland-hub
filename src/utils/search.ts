import { QueryTypes } from 'sequelize';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../constants';
import sequelize from '../database';

export interface Option {
  orderFields?: string[];
  whereFields?: string[];
  table: string;
}

export async function search(params, options: Option) {
  const {
    limit = DEFAULT_LIMIT,
    orderBy = 'id',
    offset = 0,
    orderDirection = 'DESC',
    ...otherParams
  } = params;

  if (limit > MAX_LIMIT) throw Error('max limit');

  let whereAnd = [];
  let replacements = [];
  let hasQueryTrait = false;
  for (let paramKey in otherParams) {
    if (paramKey.startsWith('int_')) {
      hasQueryTrait = true;
      let _paramKeyArr = paramKey.replace('int_', '').split('__');
      if (options.orderFields && options.orderFields.includes(_paramKeyArr[0])) {
        throw Error('invalid attribute');
      }
      let condition = getCondition(_paramKeyArr.length > 1 ? _paramKeyArr[1] : '');
      replacements.push(_paramKeyArr[0]);
      if (_paramKeyArr.length > 0 && _paramKeyArr[1] == 'in') {
        whereAnd.push(`attr->>'name'=? and (attr->>'intValue')::numeric in (?)`);
        replacements.push(otherParams[paramKey].split(','));
      } else {
        replacements.push(otherParams[paramKey]);
        whereAnd.push(`attr->>'name'=? and (attr->>'intValue')::numeric ${condition} ?`);
      }
    } else if (paramKey.startsWith('string_')) {
      hasQueryTrait = true;
      let _paramKeyArr = paramKey.replace('string_', '').split('__');
      if (options.orderFields && options.orderFields.includes(_paramKeyArr[0])) {
        throw Error('invalid attribute');
      }
      replacements.push(_paramKeyArr[0]);
      let condition = getCondition(_paramKeyArr.length > 1 ? _paramKeyArr[1] : '');
      if (_paramKeyArr.length > 0 && _paramKeyArr[1] == 'in') {
        whereAnd.push(`attr->>'name'=? and (attr->>'value')::text ${condition} (?)`);
        replacements.push(otherParams[paramKey].split(','));
      } else {
        whereAnd.push(`attr->>'name'=? and (attr->>'value')::text ${condition} ?`);
        replacements.push(otherParams[paramKey]);
      }
    } else if (paramKey === 'q') {
      whereAnd.push(`name ilike ?`);
      replacements.push(`%${otherParams[paramKey]}%`);
    } else {
      let _paramKeyArr = paramKey.split('__');
      let condition = getCondition(_paramKeyArr.length > 1 ? _paramKeyArr[1] : '');
      if (options.orderFields && options.orderFields.includes(_paramKeyArr[0])) {
        throw Error('invalid attribute');
      }
      if (_paramKeyArr.length > 0 && _paramKeyArr[1] == 'in') {
        whereAnd.push(`"${_paramKeyArr[0]}" in (?)`);
        replacements.push(otherParams[paramKey].split(','));
      } else {
        whereAnd.push(`"${_paramKeyArr[0]}" ${condition} ?`);
        replacements.push(otherParams[paramKey]);
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

  const count = await sequelize.query(`SELECT count(id) FROM ${from} ${where}`, {
    type: QueryTypes.SELECT,
    replacements,
  });
  const rows = await sequelize.query(
    `SELECT * FROM ${from} ${where} ORDER BY "${orderBy}" ${orderDirection} LIMIT ? OFFSET ?`,
    {
        type: QueryTypes.SELECT,
      replacements,
    }
  );

  return {
    count: Number(count[0].count),
    rows: rows,
  };
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
