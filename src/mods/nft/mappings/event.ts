import { Event } from 'ethers';
import { getBlock } from '../../../utils/web3';
import { getTx } from './utils';
import database from '../../../database';

const { event: EventModel } = database.models;

export const createAskEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      price: e.args._price.toString(),
      quoteToken: e.args._quoteToken.toString(),
      seller: e.args._seller.toString(),
    },
  });
};

export const createCancelAskEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {},
  });
};

export const createBidEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      price: e.args._price.toString(),
      quoteToken: e.args._quoteToken.toString(),
      bidder: e.args._bidder.toString(),
    },
  });
};

export const createSaleEvent = async (e: Event, nft, item) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      price: item.price,
      quoteToken: item.quoteToken,
      buyer: nft.owner,
    },
  });
};

export const createOfferEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      price: e.args._price.toString(),
      quoteToken: e.args._quoteToken.toString(),
      bidder: e.args.bidder.toString(),
    },
  });
};

export const createCancelBidEvent = async (e: Event, nft, bid) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      buyer: bid.bidder,
      price: bid.price,
      quoteToken: bid.quoteToken,
    },
  });
};

export const createAcceptBidEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      seller: e.args._seller.toString(),
      buyer: e.args.bidder.toString(),
      price: e.args._price.toString(),
      netPrice: e.args._netPrice.toString(),
      quoteToken: e.args._quoteToken.toString(),
    },
  });
};

export const createBuyEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      seller: e.args._seller.toString(),
      buyer: e.args.buyer.toString(),
      price: e.args._price.toString(),
      netPrice: e.args._netPrice.toString(),
      quoteToken: e.args._quoteToken.toString(),
    },
  });
};

export const createAuctionEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      price: e.args.price.toString(),
      quoteToken: e.args.quoteToken.toString(),
    },
  });
};

export const createCancelAuctionEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
  });
};

export const createAuctionBidEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      bidder: e.args.bidder.toString(),
      price: e.args.price.toString(),
      quoteToken: nft.quoteToken,
    },
  });
};

export const createCollectEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    metadata: {
      seller: e.args.seller.toString(),
      buyer: e.args.buyer.toString(),
      price: e.args.price.toString(),
      netPrice: e.args.netPrice.toString(),
      quoteToken: nft.quoteToken.toString(),
    },
  });
};

// Rent -------------------------
// -----------------
export const createLendEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    event: 'LEND',
    metadata: {
      seller: e.args.lender.toString(),
      price: e.args.pricePerDay.toString(),
      quoteToken: nft.quoteToken.toString(),
    },
  });
};

export const createCancelLendEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    event: 'CANCEL_LEND',
    metadata: {
      seller: e.args.lender.toString(),
    },
  });
};

export const createRentEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    event: 'RENT',
    metadata: {
      buyer: e.args.renter.toString(),
      expiredAt: e.args.expiredAt.toString(),
      price: e.args.price.toString(),
      quoteToken: nft.quoteToken,
      netPrice: e.args.netPrice.toString(),
    },
  });
};

export const createCancelEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    event: 'CANCEL_RENT',
    metadata: {
      buyer: e.args.renter.toString(),
    },
  });
};

export const createOfferRentEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    event: 'OFFER_RENT',
    metadata: {
      buyer: e.args.renter.toString(),
      duration: e.args.duration.toNumber(),
      price: e.args.pricePerDay.toString(),
      quoteToken: e.args.quoteToken.toString(),
    },
  });
};

export const createCancelOfferRentEvent = async (e: Event, nft) => {
  await createEvent(e, {
    nftId: nft.id,
    tokenAddress: nft.tokenAddress,
    itemId: nft.itemId,
    event: 'CANCEL_OFFER_RENT',
    metadata: {
      buyer: e.args.renter.toString(),
    },
  });
};

async function createEvent(e: Event, data: any) {
  const tx = await getTx(e);
  const block: any = await getBlock(e.blockNumber);
  const createdAt = new Date(block.timestamp * 1000);
  await EventModel.create({
    txHash: e.transactionHash,
    address: e.address,
    from: tx.from,
    to: tx.to,
    event: getEventName(e),
    createdAt: createdAt,
    ...data,
  });
}

function getEventName(e: Event) {
  return EVENTS[e.event] ? EVENTS[e.event] : e.event;
}

const EVENTS = {
  Bid: 'BID',
  CancelBid: 'CANCEL_BID',
  AcceptBid: 'TRADE',
  Trade: 'TRADE',
  AskCancel: 'CANCEL_LIST',
  AskNew: 'LIST',
  AuctionCreated: 'LIST',
  AuctionCompleted: 'TRADE',
  Created: 'MINT',
};
