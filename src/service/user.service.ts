import database from '../database';
const { user: User, item: Item, nft: NFT } = database.models;
import _ from 'lodash';
import { Op } from 'sequelize';
import { ethers } from 'ethers';
import { buildQuery } from '../utils/query';

export async function userUpsert(userId: number, userData) {
  let user = await User.findByPk(userId);
  if (!user) {
    return await User.create({
      ...userData,
      id: userId,
      muted: [],
      blocked: [],
    });
  }
  user.setAttributes(userData);
  await user.save();
  return user;
}

export async function userToggle(user, userIds: string[], enabled: boolean, field: string) {
  if (enabled) {
    user[field] = _.uniq(user[field].concat(userIds));
  } else {
    user[field] = _.filter(user[field], n => {
      return !userIds.includes(n);
    });
  }
  await user.save();
}

export async function userList(params: any) {
  const query = buildQuery({ query: params });
  const data = await User.findAndCountAll(query);
  data.rows = await Promise.all(data.rows.map(withWearable));
  return data;
}

async function withWearable(user) {
  if (!user.avatar || !user.avatar.wearables) return user;
  const baseURN = 'urn:beland:off-chain:base-avatars:';
  const basicWearables = await Item.findAll({
    where: {
      id: { [Op.in]: user.avatar.wearables.filter(wearable => wearable.includes(baseURN)) },
    },
  });
  const wearables = user.avatar.wearables.filter(wearable => !wearable.includes(baseURN));
  const userId = ethers.utils.getAddress(user.id);
  const nfts = await NFT.findAll({
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
  });

  user.avatar.wearables = nfts.map(nft => nft.itemId).concat(basicWearables.map(w => w.id));
  return user;
}
