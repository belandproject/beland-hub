import { Op } from 'sequelize';
import database from '../database';
import { validateDeploymentMetadata } from '../mods/nft/validators/deployment';
import { fetchDeploymentMetadata, fetchMetadata } from '../utils/metadata';
import { getParcelIdsFromPointers } from '../utils/parcel';
import _ from 'lodash';
import { isOperatorUpdates } from './operator.service';
const { scene: Scene, parcel: Parcel, estate: Estate } = database.models;

async function isOperator(objects, owner: string, operator: string, contractName: string) {
  const _isOperatorUpdates = await isOperatorUpdates(owner, operator, contractName);
  return (
    objects.filter(
      parcel =>
        owner == owner &&
        (parcel.operator == operator || _isOperatorUpdates || parcel.owner == operator)
    ).length > 0
  );
}

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

  const parcels = await Parcel.findAll({ where: { id: { [Op.in]: parcelIds } } });
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
