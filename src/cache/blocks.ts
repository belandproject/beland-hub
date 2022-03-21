import NodeCache from 'node-cache';

const blocks = new NodeCache({
  stdTTL: 300,
  checkperiod: 300,
});

export { blocks };
