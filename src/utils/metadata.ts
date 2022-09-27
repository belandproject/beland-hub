import axios from 'axios';
import axiosRetry from 'axios-retry';
axiosRetry(axios, { retries: 3 });

import { validateMetadata } from './validate-metadata';
function getIpfsURL(hash: string): string {
  return hash.replace('ipfs://', `${process.env.IPFS_GATEWAY}/ipfs/`);
}

export function fetchMetadata(hash: string): any {
  return axios.get(getIpfsURL(hash)).then(res => res.data);
}

export async function fetchDeploymentMetadata(tokenURI: string) {
  const rootData: any = await fetchMetadata(tokenURI);
  let sceneHash = rootData.contents.find(content => content.path == 'scene.json');
  if (!sceneHash) return;
  const sceneData: any = await fetchMetadata(sceneHash.hash);
  return { contents: rootData.contents, sceneData };
}

async function _fetchAndValidateMetadata(hash: string) {
  const data = await fetchMetadata(hash);
  const validateResult = await validateMetadata(data);
  if (!validateResult.valid) {
    throw Error(`hash: ${hash} validate schema err: ${validateResult.toString()}`);
  }
  return {
    name: data.name || '',
    description: data.description || '',
    image: data.image || '',
    contents: data.contents || [],
    representations: data.representations || [],
    minetype: data.minetype,
    traits: formatTraits(data.attributes),
    animationUrl: data.animation_url || '',
    externalUrl: data.external_url || '',
    youtubeUrl: data.youtube_url || '',
  };
}

export async function fetchAndValidateMetadata(hash: string) {
  try {
    return await _fetchAndValidateMetadata(hash);
  } catch (e) {
    console.error(e.message);
    return {
      name: '',
      description: '',
      image: '',
      contents: [],
      representations: [],
      traits: [],
    };
  }
}

function formatTraits(attributes) {
  if (!attributes) return [];
  return attributes.map(attr => {
    let displayType = attr.display_type;
    if (!displayType) {
      displayType = typeof attr.value;
    }
    let data: any = {
      name: attr.trait_type || attr.value,
      displayType: displayType,
    };

    if (typeof attr.value == 'number') {
      data.intValue = attr.value;
    } else {
      data.value = attr.value;
    }

    if (attr.max_value) {
      data.maxValue = attr.max_value;
    }
    if (attr.display_name) {
      data.displayName = attr.display_name;
    }
    return data;
  });
}

export function syncMetadata(hash: string) {}
