import Router from 'koa-joi-router';
import { checkAuthMiddleware } from '../../middlewares/auth';
import {
  handleCreate,
  handleDelete,
  handleGet,
  handleList,
  handleUpdate,
} from './collection.handlers';
import { createCollectionValidate, updateCollectionValidate } from './collection.validate';
import {
  canCreateColMiddleware,
  canUpdateColMiddleware,
  getCollectionMiddleware,
} from './middleware';
const collectionRouter = new Router();

collectionRouter.get('/:id', handleGet);
collectionRouter.get('/', handleList);

collectionRouter.route([
  {
    method: 'post',
    path: '/',
    pre: checkAuthMiddleware,
    validate: createCollectionValidate,
    handler: [canCreateColMiddleware, handleCreate],
  },
  {
    method: 'put',
    path: '/:id',
    pre: checkAuthMiddleware,
    validate: updateCollectionValidate,
    handler: [getCollectionMiddleware, canUpdateColMiddleware, handleUpdate],
  },
  {
    method: 'delete',
    path: '/:id',
    pre: checkAuthMiddleware,
    handler: [getCollectionMiddleware, canUpdateColMiddleware, handleDelete],
  },
]);

export default collectionRouter;
