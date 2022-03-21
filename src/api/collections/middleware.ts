import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from 'ethers/lib/utils';
import database from '../../database';

const Collection = database.models.collection;
const NFT_INIT_HASH = '0X';
const NFT_FACTORY_ADDRESS = '0X';

export async function getCollectionMiddleware(ctx, next) {
  const col = await Collection.findByPk(ctx.params.id);
  if (!col) {
    ctx.status = 404;
    ctx.body = { error: `Collection ${ctx.params.id} not found` };
    return;
  }
  ctx.state.col = col;
  next();
}

export async function canUpdateColMiddleware(ctx, next) {
  const col = ctx.state.col;
  if (col.creator != ctx.state.user.user) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthentication' };
    return;
  }

  if (col.isPublished) {
    ctx.status = 400;
    ctx.body = { error: 'Cannot update/delete collection published' };
    return;
  }

  ctx.state.col = col;
  next();
}

export async function canCreateColMiddleware(ctx, next) {
  const body = ctx.request.body;
  const address = computeCollectionAddress(
    NFT_FACTORY_ADDRESS,
    NFT_INIT_HASH,
    body.name,
    body.symbol,
    ctx.state.user.user
  );
  const count = await Collection.count({ where: { id: address } });
  if (count > 0) {
    ctx.status = 400;
    ctx.body = { error: 'Collection found' };
    return;
  }

  ctx.request.body.id = address;
  next();
}

export const computeCollectionAddress = (factoryAddress, nftInitHash, name, symbol, creator) => {
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [name, symbol, creator])]),
    nftInitHash
  );
};
