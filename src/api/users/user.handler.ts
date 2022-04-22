import database from '../../database';
import { buildQuery } from '../../utils/query';
import _ from 'lodash';
import { Op } from 'sequelize';
import { ethers } from 'ethers';
const { user: User, nft: NFT } = database.models;

async function withWearable(user) {
  if (!user.avatar || !user.avatar.wearables) return user;
  const baseURN = 'urn:beland:off-chain:base-avatars:';
  const basicWearables = user.avatar.wearables.filter(wearable => wearable.includes(baseURN));
  const wearables = user.avatar.wearables.filter(wearable => !wearable.includes(baseURN));
  const userId = ethers.utils.getAddress(user.id)
  return NFT.findAll({
    where: {
      [Op.or]: {
        owner: userId,
        [Op.and]: {
          renter: userId,
          expiredAt: {
            [Op.gte]: new Date(),
          },
        },
      },
      itemId: {
        [Op.in]: wearables,
      },
    },
  }).then(nfts => {
    user.avatar.wearables = nfts.map(nft => nft.itemId).concat(basicWearables);
    return user;
  });
}

export async function handleList(ctx) {
  const query = buildQuery(ctx);
  const data = await User.findAndCountAll(query);
  const rows = await Promise.all(data.rows.map(withWearable));
  ctx.status = 200;
  data.rows = rows;
  ctx.body = data;
}

export async function handleUpsert(ctx) {
  let body = ctx.request.body;
  const auth = ctx.state.user;
  let user = await User.findByPk(auth.user);
  if (!user) {
    user = await User.create({
      ...body,
      id: auth.user,
      muted: [],
      blocked: [],
    });
  } else {
    user.setAttributes(body);
    await user.save();
  }
  ctx.body = user;
}

export const handleBlockUsers = handleToggleFn('blocked');
export const handleMuteUsers = handleToggleFn('muted');

function handleToggleFn(field: string) {
  return async ctx => {
    const body = ctx.request.body;
    const user = ctx.state.user;
    if (body.enabled) {
      user[field] = _.uniq(user[field].concat(body.userIds));
    } else {
      user[field] = _.filter(user[field], n => {
        return !body.userIds.includes(n);
      });
    }
    await user.save();
    ctx.body = user;
  };
}
