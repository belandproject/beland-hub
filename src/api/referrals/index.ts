import Router from 'koa-joi-router';
import { basicCheckAuthMiddleware } from '../../middlewares/auth';
import { createReferralLink, listReferrals } from './handlers';
import { listReferralValidate } from './validate';
const referralsRouter = new Router();
referralsRouter.route([
  {
    method: 'get',
    path: '/',
    validate: listReferralValidate,
    handler: listReferrals,
  },
  {
    method: 'post',
    path: '/',
    pre: basicCheckAuthMiddleware,
    handler: createReferralLink,
  },
]);
export default referralsRouter;
