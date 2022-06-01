import Router from 'koa-joi-router';
import { list, search } from './handler';

const nftRouter = new Router();

if (process.env.ES_URL) {
  nftRouter.get('/', search);
} else {
  nftRouter.get('/', list);
}

export default nftRouter;
