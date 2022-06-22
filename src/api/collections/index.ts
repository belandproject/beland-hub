import Router from 'koa-joi-router';
import { checkAuthMiddleware } from '../../middlewares/auth';
import { gossipMiddleware } from '../../middlewares/gossip';
import { handleGet, handleList, handleUpdate } from './collection.handlers';
import { collectionUpdateValidate } from './collection.validate';
import { canUpdateColMiddleware, getCollectionMiddleware } from './middleware';

const collectionRouter = new Router();

collectionRouter.get('/:id', handleGet);
collectionRouter.get('/', handleList);

collectionRouter.route([
  {
    method: 'put',
    path: '/:id',
    validate: collectionUpdateValidate,
    pre: checkAuthMiddleware,
    handler: [gossipMiddleware, getCollectionMiddleware, canUpdateColMiddleware, handleUpdate],
  },
]);

export default collectionRouter;
