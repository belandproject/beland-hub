import { ethers, Event } from 'ethers';
import database from '../../../database';
import { getBlock, kaiWeb3 } from '../../../utils/web3';
import { Op } from 'sequelize';
import sceneABI from '../abis/Scene.json';
import { getParcelIdsFromPointers } from '../../../utils/parcel';
import { fetchMetadata, isMarket } from './utils';
import _ from 'lodash';
const { scene: Scene, parcel: Parcel } = database.models;

export const handleTransfer = async (e: Event) => {
  if (isMarket(e.args.to)) return;
  const block = await getBlock(e.blockNumber);
  const datetime = new Date(block.timestamp * 1000);
  const scene = await Scene.findByPk(e.args.tokenId.toString());
  if (!scene) {
    const tokenId = e.args.tokenId.toNumber();
    const contract = new ethers.Contract(e.address, sceneABI, kaiWeb3);
    const tokenUri = await contract.tokenURI(e.args.tokenId);
    await Scene.create({
      id: tokenId,
      owner: e.args.to,
      name: '',
      description: '',
      metadata: {},
      contents: [],
      tokenUri: tokenUri.toString(),
      createdAt: datetime,
      updatedAt: datetime,
      isDeployed: false,
    });
    try {
      await syncData(tokenId, tokenUri.toString());
    } catch (e) {
      console.error(e);
    }
    return;
  }
  scene.updatedAt = datetime;
  scene.owner = e.args.to;
  await scene.save();
};

export async function handleDeploy(e: Event) {
  try {
    await syncData(e.args.sceneId.toNumber(), e.args.tokenURI.toString());
  } catch (e) {
    console.error(e.message);
  }
}

async function syncData(tokenId: number, tokenURI: string) {
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
  const parcels = await Parcel.findAll({ where });
  if (parcels.length != parcelIds.length) return;

  let sceneIdsToRemove = _.uniqBy(
    parcels.map((parcels: { sceneId: any }) => parcels.sceneId),
    null
  );

  await Scene.destroy({
    where: {
      id: { [Op.in]: sceneIdsToRemove },
    },
  });

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
