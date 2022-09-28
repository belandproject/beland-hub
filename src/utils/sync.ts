import database from '../database';
import { getLatestBlock } from './blockNumber';
import { sleep } from './sleep';
import { web3 } from './web3';
const SyncStatus = database.models.sync_status;
const SYNC_MAX_BLOCK = 100;
export async function sync(options) {
  const syncStatuses = await SyncStatus.findOrCreate({
    where: { id: options.name },
    defaults: { lastBlock: options.getFirtBlockNumber() },
  });
  const syncStatus: any = syncStatuses[0];
  let startBlock = syncStatus.lastBlock;
  let lastestBlock = 0;
  while (true) {
    try {
      lastestBlock = getLatestBlock() - 1;
      if (lastestBlock < startBlock) {
        await sleep(5000);
        continue;
      }
      let endBlock = startBlock;
      if (lastestBlock - startBlock > SYNC_MAX_BLOCK) {
        endBlock += SYNC_MAX_BLOCK;
      } else {
        endBlock = lastestBlock;
      }
      let filter: any = options.getLogFilters(startBlock, endBlock);
      const logs = await web3.eth.getPastLogs(filter);
      console.log(
        'Applying',
        'module',
        'nft',
        'event',
        logs.length,
        'block',
        `[${startBlock}, ${endBlock}]`
      );

      options.setEndBlock(endBlock);
      await handleLogs(logs, options, endBlock, syncStatus);
      startBlock = endBlock + 1;
    } catch (e) {
      const d = new Date();
      console.error(d.toString(), ': sync err: ', e);
      await sleep(10000);
    }
  }
}

async function handleLogs(logs, options, endBlock, syncStatus) {
  try {
    await database.transaction(async () => {
      await options.handleLogs(logs);
      syncStatus.set('lastBlock', endBlock + 1);
      await syncStatus.save();
    });
  } catch (e) {
    const d = new Date();
    console.error(d.toString(), ': sync err: ', e);
    await sleep(10000);
    await handleLogs(logs, options, endBlock, syncStatus);
  }
}
