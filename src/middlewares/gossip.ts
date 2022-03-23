import { gossip } from '../utils/gossip';

export const gossipMiddleware = async function (ctx, next) {
  await next();
  gossip(ctx);
};
