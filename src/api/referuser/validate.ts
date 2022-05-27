import { Joi } from 'koa-joi-router';

export const listReferUserValidate = {
  query: Joi.object({
    address: Joi.string(),
    code: Joi.string(),
    user: Joi.string()
  }).xor('address', 'code', 'user'),
};
