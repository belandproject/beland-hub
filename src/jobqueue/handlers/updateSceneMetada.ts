import { Op } from 'sequelize';
import database from '../../database';
import { fetchMetadata } from '../../mods/nft/mappings/utils';
import { getParcelIdsFromPointers } from '../../utils/parcel';
const { scene: Scene, parcel: Parcel } = database.models;

export async function handleUpdateSceneMetadata(tokenId: number, tokenURI: string) {
  const scene = await Scene.findByPk(tokenId);
  const rootData: any = await fetchMetadata(tokenURI);
  let sceneHash = rootData.contents.find(content => content.path == 'scene.json');

  if (!sceneHash) return;
  const sceneData: any = await fetchMetadata(sceneHash.hash);
  const parcelIds = getParcelIdsFromPointers(sceneData.scene.parcels);

  const where = {
    owner: scene.owner,
    id: { [Op.in]: parcelIds },
  };
  const dbCount = await Parcel.count({ where });

  const promises = [];

  if (dbCount != parcelIds.length) return;

  promises.push(
    Parcel.update(
      {
        sceneId: scene.id,
      },
      {
        where,
      }
    )
  );

  scene.name = sceneData.display.title;
  scene.description = sceneData.display.description || '';
  scene.metadata = sceneData;
  scene.contents = rootData.contents;
  scene.isDeployed = true;

  promises.push(scene.save());
  await Promise.all(promises);
}
