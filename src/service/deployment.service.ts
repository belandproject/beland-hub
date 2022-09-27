import { Op } from 'sequelize';
import database from '../database';
import { deploymentValidate } from '../mods/nft/validators/deployment';
import { fetchMetadata } from '../utils/metadata';
import { getParcelIdsFromPointers } from '../utils/parcel';
import _ from 'lodash';
const { scene: Scene, parcel: Parcel } = database.models;

export async function saveDeploymentDataFromIPFS(tokenId: number, tokenURI: string) {
  const scene = await Scene.findByPk(tokenId);
  const rootData: any = await fetchMetadata(tokenURI);
  let sceneHash = rootData.contents.find(content => content.path == 'scene.json');

  if (!sceneHash) return;
  const sceneData: any = await fetchMetadata(sceneHash.hash);
  if (!deploymentValidate(sceneData)) return;

  const parcelIds = getParcelIdsFromPointers(sceneData.scene.parcels);
  const where = {
    owner: scene.owner,
    id: { [Op.in]: parcelIds },
  };

  const parcels = await Parcel.findAll({ where });
  if (parcels.length != parcelIds.length) return;

  await removeUnusedDeployment(parcels);

  const promises = [];
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

async function removeUnusedDeployment(parcels) {
  let sceneIdsToRemove = _.uniqBy(
    parcels.map((parcels: { sceneId: any }) => parcels.sceneId),
    null
  );

  await Scene.destroy({
    where: {
      id: { [Op.in]: sceneIdsToRemove },
    },
  });
}
