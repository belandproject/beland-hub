import Router from 'koa-joi-router';
import { checkAuthMiddleware } from '../../middlewares/auth';
import { handleGet, handleList, handleUpdate } from './collection.handlers';
import { collectionUpdateValidate } from './collection.validate';
import { canUpdateColMiddleware, getCollectionMiddleware } from './middleware';

const collectionRouter = new Router();

collectionRouter.get('/:id', handleGet);
collectionRouter.get('/', handleList);
collectionRouter.put(
  '/:id',
  checkAuthMiddleware,
  collectionUpdateValidate,
  getCollectionMiddleware,
  canUpdateColMiddleware,
  handleUpdate
);

export default collectionRouter;
