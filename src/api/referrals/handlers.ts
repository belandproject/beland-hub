import database from '../../database';
import ShortUniqueId from 'short-unique-id';
const { referral: Referral } = database.models;
const uid = new ShortUniqueId({ length: 6 });

export const createReferralLink = async ctx => {
  const referral = await Referral.create({
    code: uid(),
    address: ctx.state.user.user,
  });
  ctx.body = referral;
};

export const listReferrals = async ctx => {
  const data = await Referral.findAndCountAll({
    where: ctx.request.query,
  });
  ctx.body = data;
};
