import Router from 'koa-joi-router';
import { handleGetFilterOptions, handleList, handleSearch } from './handler';
const itemsRouter = new Router();

itemsRouter.get('/', handleList);
itemsRouter.get('/search', handleSearch);
itemsRouter.get('/filter-options', handleGetFilterOptions);

export default itemsRouter;
