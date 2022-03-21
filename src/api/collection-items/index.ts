import Router from 'koa-joi-router';
import { handleList } from './handler';
const collectionItemRouter = new Router();

collectionItemRouter.get('/', handleList);
export default collectionItemRouter;
