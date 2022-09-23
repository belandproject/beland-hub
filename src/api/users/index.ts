import Router from 'koa-joi-router';
import { checkAuthMiddleware } from '../../middlewares/auth';
import { gossipMiddleware } from '../../middlewares/gossip';
import { getUserAuthMiddleware } from './middlewares';
import { handleBlockUsers, handleList, handleMuteUsers, handleUpsert } from './user.handler';
import { userCreateOrUpdateValidate, userListValidate, userToggleValidate } from './user.validate';
const userRouter = new Router();
userRouter.route([
  {
    method: 'get',
    path: '/',
    validate: userListValidate,
    handler: [handleList],
  },
  {
    method: 'post',
    path: '/me/blocked',
    validate: userToggleValidate,
    pre: checkAuthMiddleware,
    handler: [gossipMiddleware, getUserAuthMiddleware, handleBlockUsers],
  },
  {
    method: 'post',
    path: '/me/muted',
    validate: userToggleValidate,
    pre: checkAuthMiddleware,
    handler: [gossipMiddleware, getUserAuthMiddleware, handleMuteUsers],
  },
  {
    method: 'post',
    path: '/me',
    validate: userCreateOrUpdateValidate,
    pre: checkAuthMiddleware,
    handler: [gossipMiddleware, handleUpsert],
  },
]);

export default userRouter;
