import { BigNumber, Event } from 'ethers';
import database from '../../../database';
import { fetchAndValidateMetadata } from '../../../utils/metadata';
import { getNFTId, newNFT } from '../../../utils/nft';
import { isMarket } from './utils';
import _ from 'lodash';
import { Op } from 'sequelize';
import { createSaleEvent } from './event';

const { nft: NFT, item: Item, collection: Collection } = database.models;
const PRESALE_CONTRACT = '0xa8b931f1862d0EBcA64cFD22efEfF1583bCE2C12';

function getAndFormatMetadata(tokenURIs) {
  return Promise.all(tokenURIs.map(fetchAndValidateMetadata)).then(items =>
    items.map(item => {
      return {
        name: item.name,
        description: item.description,
        image: item.image,
        traits: item.traits,
        data: {
          representations: item.representations,
          contents: item.contents,
        },
      };
    })
  );
}

export const handleAddItems = async (e: Event) => {
  const tokenAddress = e.address.toString();
  let itemCount = await Item.count({
    where: {
      tokenAddress,
    },
  });
  const col = await Collection.findByPk(tokenAddress);
  const metadatas = await getAndFormatMetadata(e.args._items.map(item => item.tokenURI.toString()));
  await Promise.all(
    e.args._items.map((item, index) => {
      const itemId = itemCount + index;
      return Item.create({
        id: tokenAddress + '-' + itemId,
        tokenAddress: e.address.toString(),
        maxSupply: item.maxSupply.toString(),
        creator: col.creator,
        totalSupply: 0,
        itemId,
        tokenURI: item.tokenURI.toString(),
        quoteToken: '',
        pricePerUnit: '0',
        onSale: false,
        ...metadatas[index],
      });
    })
  );
};

export const handleEditItems = async (e: Event) => {
  const metadatas = await getAndFormatMetadata(e.args._items.map(item => item.tokenURI.toString()));
  for (let i = 0; i < e.args.indexes.length; i++) {
    const itemId = getNFTId(e.address, e.args.indexes[i]);
    const item = await Item.findByPk(itemId);
    item.maxSupply = e.args._items[i].maxSupply.toString();
    item.tokenURI = e.args._items[i].tokenURI.toString();
    item.setAttributes(metadatas[i]);
    await item.save();
  }
};

export const handleCreate = async (e: Event) => {
  const nftId = getNFTId(e.address, e.args.tokenId);
  const itemId = getNFTId(e.address, e.args.itemId);
  const item = await Item.findByPk(itemId);
  let nft = await NFT.findByPk(nftId);
  nft.name = item.name;
  nft.description = item.description;
  nft.imageUrl = item.image;
  nft.traits = item.traits;
  nft.itemId = itemId;
  item.totalSupply = Number(item.totalSupply) + 1;
  const totalSupply = BigNumber.from(item.totalSupply)
  const maxSupply = BigNumber.from(item.maxSupply)
  if (maxSupply.lte(totalSupply)) {
    item.onSale = false;
  }
  await Promise.all([item.save(), nft.save(), createSaleEvent(e, nft, item)]);
};

export async function handleApprove(e: Event) {
  const collectionId = e.address.toString();
  const col = await Collection.findByPk(collectionId);
  col.isApproved = e.args._newValue;
  await col.save();
}

export async function handleEnableEditable(e: Event) {
  const collectionId = e.address.toString();
  const col = await Collection.findByPk(collectionId);
  col.isEditable = e.args._newValue;
  await col.save();
}

export async function handleSetMinter(e: Event) {
  const collectionId = e.address.toString();
  const col = await Collection.findByPk(collectionId);
  const _minter = e.args._minter.toString();
  const isPresaleContract = _minter === PRESALE_CONTRACT;
  let minters = [...col.minters] || [];
  const hasMinter = minters.includes(_minter);
  if (e.args._isMinter) {
    if (!hasMinter) {
      minters.push(_minter);
      if (isPresaleContract) {
        await Item.update(
          { onSale: true },
          {
            where: {
              tokenAddress: collectionId,
              quoteToken: { [Op.ne]: '' },
            },
          }
        );
      }
    }
  } else if (hasMinter) {
    minters = minters.filter(minter => minter !== _minter);
    if (isPresaleContract) {
      await Item.update(
        { onSale: false },
        {
          where: {
            tokenAddress: collectionId,
          },
        }
      );
    }
  }
  col.minters = minters;
  await col.save();
}

export async function handleTransfer(e: Event) {
  if (isMarket(e.args.to)) return;
  const nftId = getNFTId(e.address, e.args.tokenId);
  let nft = await NFT.findByPk(nftId);
  if (!nft) {
    const col = await Collection.findByPk(e.address.toString());
    nft = newNFT(e);
    nft.creator = col.creator;
    return await nft.save();
  }
  nft.owner = e.args.to;
  await nft.save();
}

export async function handleTransferCreator(e: Event) {
  const dataToUpdate = { creator: e.args.newCreator };
  const where = {
    where: {
      tokenAddress: e.address.toString(),
      creator: e.address.toString(),
    },
  };

  await NFT.update(dataToUpdate, { where });
  await Item.update(dataToUpdate, { where });

  await Collection.update(dataToUpdate, {
    where: { id: e.address.toString() },
  });
}
