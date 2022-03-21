import Router from 'koa-joi-router';
import { listScenes } from '../scenes';
import { listItems } from './items';
import { listWearables } from './wearables';

const entitiesRouter = new Router();

entitiesRouter.route([
  {
    path: '/scenes',
    method: 'get',
    handler: listScenes,
  },
  {
    path: '/wearables',
    method: 'get',
    handler: listWearables,
  },
  {
    path: '/items',
    method: 'get',
    handler: listItems,
  },
]);

export default entitiesRouter;
