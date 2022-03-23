import { hashMessage } from 'ethers/lib/utils';
import { Authenticator } from 'dcl-crypto';

export const checkAuthMiddleware = async function (ctx, next) {
  const token = resolveAuthorizationHeader(ctx);
  if (!token) return;
  const data = {
    method: ctx.request.method,
    path: ctx.request.path.replace('/v1', ''),
    body: ctx.request.body,
  };
  try {
    const hash = hashMessage(JSON.stringify(data));
    const authChain = JSON.parse(Buffer.from(token, 'base64').toString());
    if (authChain.length === 0) {
      throw Error('Invalid auth chain');
    }
    const user = authChain[0].payload;
    if (!user) {
      throw Error('Missing ETH address in auth chain');
    }
    const res = await Authenticator.validateSignature(hash, authChain, null as any, Date.now());
    if (!res.ok) {
      ctx.body = { error: res.message };
      return;
    }
    ctx.state.user = { user };
  } catch (e) {
    ctx.body = { error: 'Invalid token' };
    return;
  }
  next();
};

function resolveAuthorizationHeader(ctx) {
  if (!ctx.header || !ctx.header.authorization) {
    return;
  }

  const parts = ctx.header.authorization.trim().split(' ');

  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }
  ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"');
}
