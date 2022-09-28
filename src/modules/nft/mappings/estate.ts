import { Event } from 'ethers';
import { Op } from 'sequelize';
import database from '../../../database';
import { getNFTId, newNFT } from '../../../utils/nft';
import { getBlock } from '../../../utils/web3';
import { getNftId, isMarket } from './utils';
import _ from 'lodash';
import { parseCSV } from '../../../utils/csv';
import { updateOperator } from '../../../service/operator.service';

const { estate: Estate, parcel: Parcel, nft: NFT } = database.models;

export const handleTransfer = async (e: Event) => {
  if (isMarket(e.args.to)) return;
  const block = await getBlock(e.blockNumber);
  const estate = await Estate.findByPk(e.args.tokenId.toString());
  const time = new Date(block.timestamp * 1000);
  const nftID = getNFTId(e.address, e.args.tokenId);
  if (!estate) {
    const tokenId = e.args.tokenId.toNumber();
    await Estate.create({
      id: tokenId,
      owner: e.args.to,
      name: '',
      description: '',
      image: '',
      tokenUri: '',
      updatedAt: time,
      createdAt: time,
    });

    // create nft
    const nft = newNFT(e);
    nft.name = `Estate ${tokenId}`;
    nft.imageUrl = `https://api.beland.io/v1/estates/${tokenId}/map.png`;
    nft.traits = [
      {
        name: 'type',
        value: 'estate',
      },
    ];
    await nft.save();
    return;
  }

  estate.owner = e.args.to;
  estate.updatedAt = time;

  const nft = await NFT.findByPk(nftID);
  nft.owner = e.args.to;

  await Promise.all([estate.save(), nft.save()]);
};

export async function handleCreateBundle(e: Event) {
  const block = await getBlock(e.blockNumber);
  const time = new Date(block.timestamp * 1000);
  const estate = await Estate.findByPk(e.args.tokenId.toNumber());
  const tokenIds = e.args.tokenIds.map(tokenId => tokenId.toString());
  const promises = [
    Parcel.update(
      {
        estateId: estate.id,
        owner: estate.owner,
        updatedAt: time,
      },
      {
        where: {
          id: { [Op.in]: tokenIds },
        },
      }
    ),
  ];

  if (e.args.data) {
    const data = parseCSV(e.args.data.toString());
    estate.name = _.nth(data, 1) || '';
    estate.description = _.nth(data, 2) || '';
    estate.image = _.nth(data, 3) || '';
    promises.push(estate.save());
  }

  promises.push(updateEstateNFTPointer(e.address, e.args.tokenId));
  await Promise.all(promises);
}

async function updateEstateNFTPointer(nftAddress, tokenId) {
  // const parcels = await Parcel.findAll({
  //   where: {
  //     estateId: tokenId.toString(),
  //   },
  //   attributes: ['id'],
  // });
  // const nftID = getNFTId(nftAddress, tokenId);
  // const nft = await NFT.findByPk(nftID);
  // nft.traits = parcels.map(parcel => {
  //   return {
  //     name: 'pointers',
  //     value: getPointerFromIDLabel(parcel.id),
  //   };
  // });
  // await nft.save();
}

export async function handleBundleRemoveItems(e: Event) {
  const block = await getBlock(e.blockNumber);
  const datetime = new Date(block.timestamp * 1000);
  const tokenIds = e.args.tokenIds.map(tokenId => tokenId.toString());
  const promises = [
    Parcel.update(
      {
        estateId: null,
        updatedAt: datetime,
      },
      {
        where: {
          id: { [Op.in]: tokenIds },
        },
      }
    ),
  ];
  promises.push(updateEstateNFTPointer(e.address, e.args.tokenId));
  await Promise.all(promises);
}

export async function handleUpdateMetadata(e: Event) {
  const estate = await Estate.findByPk(e.args.tokenId.toString());
  const data = parseCSV(e.args.data.toString());
  estate.name = _.nth(data, 1) || '';
  estate.description = _.nth(data, 2) || '';
  estate.image = _.nth(data, 3) || '';
  const promises = [];
  if (estate.name) {
    const nft = await NFT.findByPk(getNftId(e.address, e.args.tokenId));
    nft.name = estate.name;
    promises.push(nft.save());
  }

  promises.push(estate.save());

  await Promise.all(promises);
}

export async function handleSetOperatorUpdates(e: Event) {
  await updateOperator({
    contract: e.address.toString(),
    operator: e.args.operator.toString(),
    owner: e.args.owner.toString(),
    approved: e.args.approved,
  });
}

export async function handleSetOperator(e: Event) {
  const estate = await Estate.findByPk(e.args.tokenId.toString());
  estate.operator = e.args.operator;
  await estate.save();
}
