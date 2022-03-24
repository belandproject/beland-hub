import { Joi } from 'koa-joi-router';

export const listReferralValidate = {
  query: Joi.object({
    address: Joi.string(),
    code: Joi.string(),
  }).xor('address', 'code'),
};
