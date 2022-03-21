import Queue from 'bull';
import { syncMetadata } from '../utils/sync-metadata';

export const metadataQueue = new Queue('metadata', process.env.REDIS);

metadataQueue.process(async function (job) {
  return syncMetadata(job.data.nftId);
});