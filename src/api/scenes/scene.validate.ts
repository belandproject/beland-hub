import { Joi } from 'koa-joi-router';

export const sceneListValidate = {
  type: 'json',
  body: {
    pointers: Joi.array().items(Joi.string()).min(1).max(1000).required(),
  },
};
