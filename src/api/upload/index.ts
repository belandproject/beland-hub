import Router from 'koa-joi-router';
import multer from '@koa/multer';
import { checkAuthMiddleware } from '../../middlewares/auth';
import { createMetadata, uploadFile } from './handler';

const uploadRouter = new Router();
const uploadMulter = multer(); // note you can pass `multer` options here

uploadRouter.route([
  {
    path: '/',
    method: 'post',
    pre: checkAuthMiddleware,
    handler: [uploadMulter.single('file'), uploadFile],
  },
  {
    path: '/metadata',
    method: 'post',
    pre: checkAuthMiddleware,
    handler: createMetadata,
  },
]);

export default uploadRouter;
