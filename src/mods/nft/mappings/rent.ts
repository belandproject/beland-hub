import { Event } from 'ethers';
import { getNftId } from './utils';
import database from '../../../database';
import { getBlock } from '../../../utils/web3';

const { nft: NFT } = database.models;

export async function handleLend(e: Event) {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;
  const block = await getBlock(e.blockNumber);

  nft.exchangeAddress = e.address.toString();
  nft.quoteToken = e.args.quoteToken.toString();
  nft.price = e.args.pricePerDay.toString();
  nft.listedAt = new Date(block.timestamp * 1000);
  nft.onLending = true;
  await nft.save();
}

export async function handleCancelLend(e: Event) {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  nft.exchangeAddress = '';
  nft.quoteToken = '';
  nft.price = 0;
  nft.listedAt = null;
  nft.onLending = false;
  await nft.save();
}

export async function handleRent(e: Event) {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  nft.renter = e.args.renter;
  nft.expiredAt = e.args.expiredAt;
  await nft.save();
}
