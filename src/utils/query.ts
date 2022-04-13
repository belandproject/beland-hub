import { Op } from 'sequelize';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../constants';
import database from '../database';

export const buildWhere = input => {
  let where: any = {};

  for (var key in input) {
    const keys = key.split('__');
    if (keys.length == 2) {
      if (Op[keys[1]]) {
        let values = input[key];
        if (!Array.isArray(values) && ['in', 'notIn'].includes(keys[1])) {
          values = values.split(',');
        }

        where[keys[0]] = {
          [Op[keys[1]]]: values,
        };
      } else {
        throw Error('invalid query');
      }
    } else {
      where[keys[0]] = input[key];
    }
  }
  return where;
};

export const buildQuery = ctx => {

  const {
    orderBy = 'id',
    orderDirection = 'desc',
    limit = DEFAULT_LIMIT,
    offset = 0,
    include,
    ids,
    ...params
  } = ctx.query;


  if (limit > MAX_LIMIT) {
    throw Error('limit must be less than ' + MAX_LIMIT);
  }

  let query: any = {
    where: buildWhere(params),
    order: [[orderBy, orderDirection]],
    limit,
    offset,
    include: include ? include.split(',') : [],
  };
  console.log(query)
  return query;
};

export function buildRouteList(modelName: string) {
  return async function (ctx) {
    const query = buildQuery(ctx);
    const items = await database.models[modelName].findAndCountAll(query);
    ctx.status = 200;
    ctx.body = items;
  };
}
