import Router from 'koa-joi-router';
import { handleGet, handleList } from './collection.handlers';

const collectionRouter = new Router();

collectionRouter.get('/:id', handleGet);
collectionRouter.get('/', handleList);

export default collectionRouter;
