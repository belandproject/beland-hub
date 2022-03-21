import { Event } from 'ethers';
import database from '../../../database';
import { getNFTId, newNFT } from '../../../utils/nft';
import { getBlock } from '../../../utils/web3';
import { getLandName, isMarket } from './utils';
import _ from 'lodash'

const { parcel: Parcel, nft: NFT, scene: Scene } = database.models;

export const handleTransfer = async (e: Event) => {
  if (isMarket(e.args.to)) return;
  const block = await getBlock(e.blockNumber);
  const datetime = new Date(block.timestamp * 1000);
  const parcel = await Parcel.findByPk(e.args.tokenId.toString());
  if (!parcel) {
    const tokenId = e.args.tokenId.toNumber();
    const x = Math.floor(tokenId % 300);
    const y = Math.floor(tokenId / 300);
    await Parcel.create({
      id: tokenId,
      owner: e.args.to,
      name: '',
      description: '',
      image: '',
      x: x,
      y: y,
      updatedAt: datetime,
      createdAt: datetime,
    });

    // create nft
    const nft = newNFT(e);
    nft.name = getLandName(x, y);
    nft.traits = [
      {
        name: 'x',
        intValue: x - 150,
      },
      {
        name: 'y',
        intValue: y - 150,
      },
    ];
    return await nft.save();
  } else if (e.args.to != parcel.owner) {
    if (parcel.sceneId) {
      const scene = await Scene.findByPk(parcel.sceneId);
      scene.isDeployed = false;
      await scene.save();
    }

    parcel.updatedAt = datetime;
    parcel.owner = e.args.to;
    parcel.sceneId = null;
    await parcel.save();

    const nft = await NFT.findByPk(getNFTId(e.address, e.args.tokenId));
    nft.owner = e.args.to;
    await nft.save();
  }
};

export async function handleUpdateMetadata(e: Event) {
  const parcel = await Parcel.findByPk(e.args.landId.toString());
  const data = e.args.data.toString().split(',');
  parcel.name = _.nth(data, 1) || '';
  parcel.description = _.nth(data, 2) || '';
  parcel.image = _.nth(data, 2) || '';
  await parcel.save();
}
