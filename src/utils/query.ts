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
  const input = Object.assign({}, ctx.query);

  let limit = input.limit || DEFAULT_LIMIT;
  delete input.limit;
  if (limit > MAX_LIMIT) {
    throw Error('limit must be less than ' + MAX_LIMIT);
  }

  let offset = input.offset || 0;
  delete input.offset;
  if (input.page > 1) {
    offset = limit * (input.page - 1);
  }

  let query: any = {
    where: {},
    limit,
    offset,
  };

  if (input.id) {
    query.where.id = {
      [Op.in]: input.id.split(','),
    };
    delete input.id;
  }
  delete input.orderName;
  if (input.orderBy) {
    let orderDirection = 'DESC';
    if (input.orderDirection == 'asc') {
      orderDirection = 'ASC';
    }

    query.order = [[input.orderBy, orderDirection]];
    delete input.orderBy;
    delete input.orderDirection;
  }

  query.where = {
    ...query.where,
    ...buildWhere(input),
  };
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
