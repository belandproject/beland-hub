import { txs } from '../../../cache/txs';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Event } from '@ethersproject/contracts';
import database from '../../../database';
import axios from 'axios';
axios.defaults.timeout = 5000;

const { bid: Bid } = database.models;
export function getNftId(contract, tokenId) {
  return contract.toString() + '-' + tokenId.toString();
}

const MARKETS = [
  '0x871F3a16fF9d267854628966a2bA36665e0bD437',
  '0xAd3bE9adb697daDBAf78E461213aF4668713C5f3',
  '0x54d8eB06793B11C2AAD7a4e65F3D3b01101FCCEb',
  '0x7b966AE5E32fE61F0F3ea9c9468FfBEbb3Bd1611',
];

export async function getTx(event: Event): Promise<TransactionResponse> {
  let cached: any = txs.get(event.transactionHash);
  if (cached) return cached;
  cached = await event.getTransaction();
  txs.set(event.transactionHash, cached);
  return cached;
}

export function highestBid(nftId: string) {
  return Bid.findOne({
    where: {
      nftId,
    },
    order: [['price', 'DESC']],
  });
}

export async function highestBidPrice(nftId: string) {
  const bid = await highestBid(nftId);
  if (bid) return bid.price;
  return '0';
}

function getIpfsURL(hash: string): string {
  return hash.replace('ipfs://', `${process.env.IPFS_GATEWAY}/ipfs/`);
}

export function getParcelIdFromLocation(path: string): number {
  const location = path.split(',');
  if (location.length < 2) return;
  let x = (Number(location[0]) + 150) % 300;
  let y = (Number(location[1]) + 150) * 300;

  return x + y;
}

export function getPointerFromID(id: number) {
  let x = Math.floor(id % 300) - 150;
  let y = Math.floor(id / 300) - 150;
  return { x, y };
}

export function getPointerFromIDLabel(id: number) {
  const xy = getPointerFromID(id);
  return `(${xy.x},${xy.y})`;
}

export function getLandName(x, y) {
  return `LAND(${x}, ${y})`;
}

export function fetchMetadata(hash: string): any {
  return axios.get(getIpfsURL(hash)).then(res => res.data);
}

export function isMarket(contract): boolean {
  return MARKETS.includes(contract.toString());
}
