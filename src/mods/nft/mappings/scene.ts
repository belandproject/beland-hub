import { ethers, Event } from 'ethers';
import database from '../../../database';
import { getBlock, kaiWeb3 } from '../../../utils/web3';
import sceneABI from '../abis/Scene.json';
import { isMarket } from './utils';
import _ from 'lodash';
import { saveDeploymentDataFromIPFS } from '../../../service/deployment.service';
const { scene: Scene } = database.models;

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
      await saveDeploymentDataFromIPFS(tokenId, tokenUri.toString());
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
  const block = await getBlock(e.blockNumber);
  const datetime = new Date(block.timestamp * 1000);
  await Scene.create({
    id: e.args.deploymentId.toNumber(),
    owner: e.args.owner,
    name: '',
    description: '',
    metadata: {},
    contents: [],
    tokenUri: e.args.tokenURI.toString(),
    createdAt: datetime,
    updatedAt: datetime,
    isDeployed: false,
  });
  try {
    await saveDeploymentDataFromIPFS(e.args.deploymentId.toNumber(), e.args.tokenURI.toString());
  } catch (e) {
    console.error(e.message);
  }
}

export async function handleRemote(e: Event) {
  await Scene.destroy({ where: { id: e.args.deploymentId } });
}
