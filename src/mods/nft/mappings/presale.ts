import { Event } from 'ethers';
import database from '../../../database';

const { item: Item } = database.models;

export const handleAddPresale = async (e: Event) => {
  const itemId = e.args.nft.toString() + '-' + e.args.itemId.toNumber();
  let item = await Item.findByPk(itemId);
  item.pricePerUnit = e.args.presale.pricePerUnit.toString();
  item.quoteToken = e.args.presale.quoteToken.toString();
  item.onSale = true;
  await item.save();
};

export const handleCancelPresale = async (e: Event) => {
  const itemId = e.args.nft.toString() + '-' + e.args.itemId.toNumber();
  let item = await Item.findByPk(itemId);
  item.pricePerUnit = '0';
  item.quoteToken = '';
  item.onSale = false;
  await item.save();
};
