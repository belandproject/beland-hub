import Router from 'koa-joi-router';
import { list, searchNFT } from './handler';

const nftRouter = new Router();

if (process.env.ES_URL) {
  nftRouter.get('/', searchNFT);
} else {
  nftRouter.get('/', list);
}

export default nftRouter;
