import { Joi } from 'koa-joi-router';


export const collectionUpdateValidate = {
    type: 'json',
    body: {
      description: Joi.string(),
      avatar: Joi.string(),
      banner: Joi.string()
    },
  };
  