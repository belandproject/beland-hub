import { Event } from 'ethers';
import database from '../database';

const { nft: NFT } = database.models;

export function newNFT(e: Event) {
  return NFT.build({
    id: getNFTId(e.address, e.args.tokenId),
    creator: e.args.to,
    owner: e.args.to,
    tokenAddress: e.address.toString(),
    tokenId: e.args.tokenId.toString(),
    price: 0,
    votes: 0,
    onSale: false,
    onAuction: false,
    hasOffer: false,
    isBundle: false,
    onLending: false,
    bundles: [],
    traits: [],
    offerCount: 0,
    status: 0,
    quantity: 0,
  });
}

export const getNFTId = (address, tokenId) => {
  return address.toString() + '-' + tokenId.toString();
};

export function getAnimationURL(nft) {
  const type = nft.traits.find(t => t.name == 'type')?.value;
  if (type == 'wearable' && nft.itemId) {
    const itemId = nft.itemId.split('-');
    return `https://wearable-preview.beland.io/?contract=${itemId[0]}&item=${itemId[1]}`;
  }
  return nft.animationUrl;
}
