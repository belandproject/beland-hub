import Router from 'koa-joi-router';
import { listScenes, postListScenes } from './scene.handlers';
import { sceneListValidate } from './scene.validate';

const scenesRouter = new Router();

scenesRouter.get('/', listScenes);

scenesRouter.route([
  {
    method: 'post',
    path: '/',
    validate: sceneListValidate,
    handler: [postListScenes],
  },
]);

export { scenesRouter };
