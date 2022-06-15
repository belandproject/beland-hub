import { Event } from 'ethers';
import { getNftId } from './utils';
import database from '../../../database';
import { getBlock } from '../../../utils/web3';
import { createCancelLendEvent, createCancelOfferRentEvent, createLendEvent, createOfferRentEvent, createRentEvent } from './event';

const { nft: NFT, lend_offer: Offer } = database.models;

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
  await createLendEvent(e, nft)
}

export async function handleCancelLend(e: Event) {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;

  await createCancelLendEvent(e, nft)

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

  await createRentEvent(e, nft)
}

export async function handleCreateOffer(e: Event) {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;
  nft.lendOfferCount++;
  await nft.save();

  await Offer.create({
    txhash: e.transactionHash,
    nftId,
    address: e.address,
    renter: e.args.renter.toString(),
    quoteToken: e.args._quoteToken.toString(),
    price: e.args._price.toString(),
    duration: e.args.duration.toNumber(),
  });

  await createOfferRentEvent(e, nft)
}

export async function handleCancelOffer(e: Event) {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;
  nft.lendOfferCount--;
  await nft.save();
  await Offer.destroy({ where: { nftId, renter: e.args.renter.toString() } });
  await createCancelOfferRentEvent(e, nft);
}

export async function handleAcceptOffer(e: Event) {
  const nftId = getNftId(e.args.nft, e.args.tokenId);
  const nft = await NFT.findByPk(nftId);
  if (!nft) return;
  nft.lendOfferCount--;
  nft.renter = e.args.renter;
  nft.expiredAt = e.args.expiredAt;
  await nft.save();
  await Offer.destroy({ where: { nftId, renter: e.args.renter.toString() } });
  await createRentEvent(e, nft);
}
