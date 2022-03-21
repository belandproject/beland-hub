import { Joi } from 'koa-joi-router';

export const createCollectionValidate = {
  type: 'json',
  body: {
    name: Joi.string().required(),
    symbol: Joi.string().required(),
  },
};

export const updateCollectionValidate = {
  type: 'json',
  body: {
    name: Joi.string(),
    symbol: Joi.string(),
  },
};
