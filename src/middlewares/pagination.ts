import { Joi } from 'koa-joi-router';

export const paginationValidate = {
  query: {
    limit: Joi.number().max(1000).default(30).optional(),
    offset: Joi.number().default(0).max(100000).optional(),
  },
};
