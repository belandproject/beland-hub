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
    return await saveDeploymentDataFromIPFS(tokenId, tokenUri.toString());
  }
  scene.updatedAt = datetime;
  scene.owner = e.args.to;
  await scene.save();
};

export async function handleDeploy(e: Event) {
  // const block = await getBlock(e.blockNumber);
  const deploymentId = e.args.sceneId.toNumber();
  const tokenURI = e.args.tokenURI.toString();
  
  // const datetime = new Date(block.timestamp * 1000);
  // await Scene.create({
  //   id: deploymentId,
  //   owner: e.args.owner,
  //   name: '',
  //   description: '',
  //   metadata: {},
  //   contents: [],
  //   tokenUri: e.args.tokenURI.toString(),
  //   createdAt: datetime,
  //   updatedAt: datetime,
  //   isDeployed: false,
  // });
  await saveDeploymentDataFromIPFS(deploymentId, tokenURI);
}

export async function handleRemote(e: Event) {
  await Scene.destroy({ where: { id: e.args.deploymentId } });
}
