import NodeCache from 'node-cache';

const txs = new NodeCache({
  stdTTL: 300,
  checkperiod: 300,
});

export { txs };
