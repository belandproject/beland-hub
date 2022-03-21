import Router from 'koa-joi-router';
import { checkAuthMiddleware, loginValidateMiddleware } from '../../middlewares/auth';
import { getUserAuthMiddleware } from './middlewares';
import {
  handleBlockUsers,
  handleList,
  handleLogin,
  handleMuteUsers,
  handleUpsert,
} from './user.handler';
import { userCreateOrUpdateValidate, userLoginValidate, userToggleValidate } from './user.validate';
const userRouter = new Router();
userRouter.get('/', handleList);
userRouter.route([
  {
    method: 'post',
    path: '/login',
    validate: userLoginValidate,
    handler: [loginValidateMiddleware, handleLogin],
  },
  {
    method: 'post',
    path: '/me/blocked',
    validate: userToggleValidate,
    pre: checkAuthMiddleware,
    handler: [getUserAuthMiddleware, handleBlockUsers],
  },
  {
    method: 'post',
    path: '/me/muted',
    validate: userToggleValidate,
    pre: checkAuthMiddleware,
    handler: [getUserAuthMiddleware, handleMuteUsers],
  },
  {
    method: 'post',
    path: '/me',
    validate: userCreateOrUpdateValidate,
    pre: checkAuthMiddleware,
    handler: handleUpsert,
  },
]);

export default userRouter;
