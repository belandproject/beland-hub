import { Op } from 'sequelize';
import database from '../../database';

const { collection_item: Item } = database.models;
export async function listWearables(ctx) {
  const where: any = {};
  if (ctx.query.collectionId) {
    where.tokenAddress = ctx.query.collectionId;
  } else {
    where.id = ctx.query.wearableId || '';
  }

  where.traits = {
    [Op.contains]: [
      {
        name: 'type',
        value: 'wearable',
      },
    ],
  };

  const items = await Item.findAll({
    where,
  });

  ctx.body = {
    wearables: items.map(item => {
      const rarity = item.traits.find(trait => trait.name == 'rarity');
      const category = item.traits.find(trait => trait.name == 'category');
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        collectionAddress: item.tokenAddress,
        rarity: rarity ? rarity.value : '',
        category: category ? category.value : '',
        image: item.image.replace('ipfs://', `${process.env.IPFS_GATEWAY}/ipfs/`),
        data: {
          replaces: item.traits.filter(trait => trait.name == 'replaces').map(trait => trait.value),
          hides: item.traits.filter(trait => trait.name == 'hides').map(trait => trait.value),
          tags: item.traits.filter(trait => trait.name == 'tags').map(trait => trait.value),
          representations: item.data.representations.map(representation => {
            return {
              ...representation,
              contents: representation.contents.map(key => {
                return {
                  key: key.path,
                  url: key.hash.replace('ipfs://', `${process.env.IPFS_GATEWAY}/ipfs/`),
                };
              }),
            };
          }),
        },
      };
    }),
    pagination: { limit: 500 },
  };
}
