import { Event } from 'ethers';
import database from '../../../database';
import { createTemplate } from '../../../service/datasource';
const { collection: Collection } = database.models;
export const handleCreate = async (e: Event) => {
  await Collection.upsert({
    id: e.args.nft.toString(),
    creator: e.args.creator.toString(),
    name: e.args.name.toString(),
    symbol: e.args.symbol.toString(),
    isApproved: false,
    isEditable: true,
    isPublished: true,
  });
  await createTemplate('nft', e.args.nft.toString(), e.blockNumber);
};
