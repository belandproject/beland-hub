import { BigNumber, Event } from 'ethers';
import { getNftId } from './utils';
import database from '../../../database';
import { getPrice } from '../../../utils/price';
import {
  createAcceptBidEvent,
  createAskEvent,
  createOfferEvent,
  createBuyEvent,
  createCancelAskEvent,
  createCancelBidEvent,
} from './event';
import { getBlock } from '../../../utils/web3';

const { nft: NFT, bid: Bid } = database.models;

export const handleCreateAsk = async (e: Event) => {
  const nftId = getNftId(e.args._nft, e.args._tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  const block = await getBlock(e.blockNumber);
  nft.price = getPrice(e.args._price).toString();
  nft.quoteToken = e.args._quoteToken.toString();
  nft.exchangeAddress = e.address;
  nft.onSale = true;
  nft.listedAt = new Date(block.timestamp * 1000);
  await nft.save();

  await createAskEvent(e, nft);
};

export const handleCancelAsk = async (e: Event) => {
  const nftId = getNftId(e.args._nft, e.args._tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  nft.price = 0;
  nft.onSale = false;
  nft.quoteToken = null;
  nft.exchangeAddress = null;
  await nft.save();

  await createCancelAskEvent(e, nft);
};

export const handleCreateBid = async (e: Event) => {
  const nftId = getNftId(e.args._nft, e.args._tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  nft.offerCount++;
  nft.hasOffer = true;
  await Promise.all([
    createOfferEvent(e, nft),
    nft.save(),
    Bid.create({
      nftId,
      address: e.address,
      bidder: e.args.bidder.toString(),
      quoteToken: e.args._quoteToken.toString(),
      price: e.args._price.toString(),
      txhash: e.transactionHash,
    }),
  ]);
};

export const handleCancelBid = async (e: Event) => {
  const nftId = getNftId(e.args._nft, e.args._tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  nft.offerCount--;
  nft.hasOffer = nft.offerCount > 0;

  const bid = await Bid.findOne({
    where: {
      nftId,
      bidder: e.args.bidder.toString(),
    },
  });

  await Promise.all([createCancelBidEvent(e, nft, bid), bid.destroy(), nft.save()]);
};

export const handleAcceptBid = async (e: Event) => {
  const nftId = getNftId(e.args._nft, e.args._tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  const block = await getBlock(e.blockNumber);
  nft.offerCount--;
  nft.hasOffer = nft.offerCount > 0;
  nft.price = 0;
  nft.onSale = false;
  nft.soldAt = new Date(block.timestamp * 1000);

  await Promise.all([
    nft.save(),
    createAcceptBidEvent(e, nft),
    Bid.destroy({
      where: {
        nftId,
        bidder: e.args.bidder.toString(),
      },
    }),
  ]);
};

export const handleBuy = async (e: Event) => {
  const nftId = getNftId(e.args._nft, e.args._tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  const block = await getBlock(e.blockNumber);
  nft.price = 0;
  nft.onSale = false;
  nft.soldAt = new Date(block.timestamp * 1000);

  await Promise.all([nft.save(), createBuyEvent(e, nft)]);
};
