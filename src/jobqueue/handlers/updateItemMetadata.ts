import { fetchAndValidateMetadata } from '../../utils/metadata';
import database from '../../database';
import { Op } from 'sequelize';
const { item: Item } = database.models;

export async function handleUpdateItemMetadata(itemIds: string[]) {
  const items = await Item.findAll({ where: { id: { [Op.in]: itemIds } } });
  const metadatas = await getItemMetadata(items.map(item => item.tokenUri));
  await Promise.all(
    metadatas.map((metadata, index) => {
      items[index].setAttributes(metadata);
      return items[index].save();
    })
  );
}

function getItemMetadata(tokenURIs) {
  return Promise.all(tokenURIs.map(fetchAndValidateMetadata)).then(items =>
    items.map(item => {
      return {
        name: item.name,
        description: item.description,
        imageUrl: item.image,
        traits: item.traits,
        data: {
          representations: item.representations,
          contents: item.contents,
        },
      };
    })
  );
}
