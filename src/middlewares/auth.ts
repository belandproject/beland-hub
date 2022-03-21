import jwt from 'koa-jwt';
import { verify } from '../utils/verify';
const EXPIRE_DUATION = 120;

export const checkAuthMiddleware = jwt({ secret: process.env.JWT_SECRET });

export async function loginValidateMiddleware(ctx, next) {
  const body = ctx.request.body;
  const timestamp = Math.floor(Date.now() / 1000);
  if (body.timestamp + EXPIRE_DUATION < timestamp) {
    ctx.status = 400;
    ctx.message = 'signature expired';
    return;
  }
  const msg = ['Beland:login', body.name, String(body.timestamp)];
  const ok = await verify(body.id, msg.join(':'), body.sign);
  if (!ok) {
    ctx.status = 400;
    ctx.message = 'invalid signature';
    return;
  }
  next();
}
