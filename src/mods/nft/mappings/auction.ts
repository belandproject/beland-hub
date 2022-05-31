import { Event } from 'ethers';
import database from '../../../database';
import { getPrice } from '../../../utils/price';
import { getBlock } from '../../../utils/web3';
import {
  createAuctionBidEvent,
  createAuctionEvent,
  createCancelAuctionEvent,
  createCollectEvent,
} from './event';
import { getNftId } from './utils';

const { nft: NFT } = database.models;

export const handleCreateAuction = async (e: Event) => {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  const block = await getBlock(e.blockNumber);
  nft.onAuction = true;
  nft.price = getPrice(e.args.price).toString();
  const startTime = e.args.startTime.toNumber();
  if (startTime > 0) {
    nft.auctionStartTime = new Date(e.args.startTime.toNumber() * 1000);
  }
  nft.auctionEndTime = new Date(e.args.endTime.toNumber() * 1000);
  nft.quoteToken = e.args.quoteToken.toString();
  nft.exchangeAddress = e.address;
  nft.listedAt = new Date(block.timestamp * 1000);
  await nft.save();

  await createAuctionEvent(e, nft);
};

export const handleCancelAuction = async (e: Event) => {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  nft.onAuction = false;
  nft.price = 0;
  nft.auctionStartTime = null;
  nft.auctionEndTime = null;
  nft.quoteToken = null;
  nft.exchangeAddress = null;
  nft.listedAt = null;
  await nft.save();
  await createCancelAuctionEvent(e, nft);
};

export const handleBid = async (e: Event) => {
  const block: any = await getBlock(e.blockNumber);
  const bidDate = new Date(block.timestamp * 1000);

  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  nft.price = e.args.price.toString();
  nft.bidder = e.args.bidder.toString();
  nft.bidDate = bidDate;
  await nft.save();
  await createAuctionBidEvent(e, nft);
};

export const handleCollect = async (e: Event) => {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  const block = await getBlock(e.blockNumber);
  await createCollectEvent(e, nft);
  nft.price = 0;
  nft.bidder = null;
  nft.auctionStartTime = null;
  nft.auctionEndTime = null;
  nft.onAuction = false;
  nft.quoteToken = null;
  nft.exchangeAddress = null;
  nft.soldAt = new Date(block.timestamp * 1000);
  nft.bidDate = null;
  await nft.save();
};
