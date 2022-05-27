import database from '../../database';
const { refer_user: ReferUser, referral: Referral } = database.models;

export const referUser = async ctx => {
  const body = ctx.request.body;
  const referral = await Referral.findByPk(body.code);
  if (!referral) throw Error("referral not found");
  if (referral.address === ctx.state.user.user) throw Error("cannot refer to yourself")
  
  const referUser = await ReferUser.create({
    code: referral.code,
    referrer: referral.address,
    user: ctx.state.user.user,
  });
  ctx.body = referUser;
};

export const listReferUser = async ctx => {
  const data = await ReferUser.findAndCountAll({
    where: ctx.request.query,
  });
  ctx.body = data;
};
