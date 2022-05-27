import Router from 'koa-joi-router';
import { basicCheckAuthMiddleware } from '../../middlewares/auth';
import { referUser, listReferUser } from './handlers';
import { listReferUserValidate } from './validate';
const referUserRouter = new Router();
referUserRouter.route([
  {
    method: 'get',
    path: '/',
    validate: listReferUserValidate,
    handler: listReferUser,
  },
  {
    method: 'post',
    path: '/',
    pre: basicCheckAuthMiddleware,
    handler: referUser,
  },
]);
export default referUserRouter;
