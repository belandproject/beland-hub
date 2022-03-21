import { Event } from 'ethers';
import { getNftId, isMarket } from './utils';
import database from '../../../database';
import { newNFT } from '../../../utils/nft';

const { nft: NFT } = database.models;

export async function handleCreateBundle(e: Event) {
  const nftId = getNftId(e.address, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  nft.bundles = e.args.groups;
  nft.isBundle = true;
  await nft.save();
}

export async function handleTransfer(e: Event) {
  if (isMarket(e.args.to)) return;
  const nftId = getNftId(e.address, e.args.tokenId);
  let nft = await NFT.findByPk(nftId);
  if (!nft) {
    nft = newNFT(e);
    return await nft.save();
  }
  nft.owner = e.args.to;
  await nft.save();
}
