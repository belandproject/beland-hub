export function getIpfsFullURL(hash) {
  if (hash && hash.includes('ipfs://')) {
    return hash.replace('ipfs://', process.env.IPFS_GATEWAY + '/ipfs/');
  }
  return hash;
}
