import Router from 'koa-joi-router';
import { handleList, handleSearch } from './handler';
const itemsRouter = new Router();

itemsRouter.get('/', handleList);
itemsRouter.get('/search', handleSearch);

export default itemsRouter;
