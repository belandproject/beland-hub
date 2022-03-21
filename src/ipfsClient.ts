
  
import { create, IPFSHTTPClient } from 'ipfs-http-client';
const ipfsCluster = require('ipfs-cluster-api');

let ipfsClient: IPFSHTTPClient;
let ipfsClusterClient;

const IS_CLUSTER = !!process.env.IPFS_CLUSTER;

if (IS_CLUSTER) {
  ipfsClusterClient = ipfsCluster(process.env.IPFS_CLUSTER);
} else {
  ipfsClient = create(process.env.IPFS as any);
}

function pin(cid) {
  if (IS_CLUSTER) {
    return ipfsClusterClient.pin.add(cid, {
      replication: 3,
    });
  }
  return ipfsClient.pin.add(cid);
}

function add(source) {
  if (IS_CLUSTER) {
    return ipfsClusterClient.add(source, {
      'replication-min': 3,
      'replication-max': 3,
      'local': true
    }).then(res => res[0].hash);
  }
  return ipfsClient.add(source).then(res => res.cid.toString());
}

export { pin, add };