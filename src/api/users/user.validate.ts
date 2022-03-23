import { Joi } from 'koa-joi-router';

const color = Joi.object({
  color: Joi.object({
    r: Joi.number(),
    g: Joi.number(),
    b: Joi.number(),
  }),
});

export const userCreateOrUpdateValidate = {
  type: 'json',
  body: {
    name: Joi.string(),
    introduction: Joi.string(),
    avatar_image: Joi.string(),
    banner_image: Joi.string(),
    website: Joi.string(),
    email: Joi.string().email(),
    avatar: Joi.object({
      bodyShape: Joi.string(),
      eyes: color,
      hair: color,
      skin: color,
      wearables: Joi.array().items(Joi.string()).max(10).min(1),
    }),
  },
};

export const userToggleValidate = {
  type: 'json',
  body: {
    userIds: Joi.array().items(Joi.string()).min(1).required(),
    enabled: Joi.bool().required(),
  },
};
