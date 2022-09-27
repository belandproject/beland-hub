import { Op } from 'sequelize';
import database from '../database';
import { validateDeploymentMetadata } from '../mods/nft/validators/deployment';
import { fetchDeploymentMetadata } from '../utils/metadata';
import { getParcelIdsFromPointers } from '../utils/parcel';
import _ from 'lodash';
import { isOperator } from './operator.service';
const { scene: Scene, parcel: Parcel, estate: Estate } = database.models;

async function hasParcelsPermission(parcels, owner: string, operator: string) {
  // validate all parcels without estate
  const parcelsWithoutEstate = parcels.filter(parcel => parcel.estateId == null);
  if (parcelsWithoutEstate.length > 0) {
    if (!(await isOperator(parcelsWithoutEstate, owner, operator, 'parcel'))) return false;
  }

  // validate all estate
  const estateIds = _.uniq(
    parcels.filter(parcel => parcel.estateId != null).map(parcel => parcel.estateId)
  );
  const estates = await Estate.findAll({ where: { [Op.in]: estateIds } });
  if (estates.length > 0) {
    if (!(await isOperator(estates, owner, operator, 'estate'))) return false;
  }
  return true;
}

async function validateParcelsPermission(parcels, owner: string, operator: string) {
  if (!hasParcelsPermission(parcels, owner, operator)) {
    throw Error('Unauthorized');
  }
}

export async function saveDeploymentDataFromIPFS(tokenId: number, tokenURI: string) {
  try {
    const { contents, sceneData } = await fetchDeploymentMetadata(tokenURI);
    validateDeploymentMetadata(sceneData);
    await saveDeploymentData(tokenId, sceneData, contents);
  } catch (err) {
    console.log(err);
  }
}

export async function saveDeploymentData(tokenId: number, sceneData: any, contents) {
  const scene = await Scene.findByPk(tokenId);
  const parcelIds = getParcelIdsFromPointers(sceneData.scene.parcels);
  const where = { id: { [Op.in]: parcelIds } };

  const parcels = await Parcel.findAll({ where });
  if (parcels.length != parcelIds.length) return;

  await validateParcelsPermission(parcels, parcels[0].owner, scene.owner);
  await removeUnusedDeployment(parcels);

  const promises = [];
  promises.push(Parcel.update({ sceneId: scene.id }, { where }));

  scene.name = sceneData.display.title;
  scene.description = sceneData.display.description || '';
  scene.metadata = sceneData;
  scene.contents = contents;
  scene.isDeployed = true;

  promises.push(scene.save());
  await Promise.all(promises);
}

async function removeUnusedDeployment(parcels) {
  let sceneIds = _.uniq(parcels.map((parcels: { sceneId: any }) => parcels.sceneId));
  await Scene.destroy({
    where: {
      id: { [Op.in]: sceneIds },
    },
  });
}
