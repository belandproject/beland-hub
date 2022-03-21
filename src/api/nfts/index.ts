import Router from 'koa-joi-router';
import { list, searchNFT } from './handler';

const nftRouter = new Router();

if (process.env.ES_URL) {
  nftRouter.get('/nfts', searchNFT);
} else {
  nftRouter.get('/nfts', list);
}

export default nftRouter;
