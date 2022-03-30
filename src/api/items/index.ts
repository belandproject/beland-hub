import Router from 'koa-joi-router';
import { handleList } from './handler';
const itemsRouter = new Router();

itemsRouter.get('/', handleList);
export default itemsRouter;
