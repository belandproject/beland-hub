import { hashMessage } from 'ethers/lib/utils';
import { Authenticator } from 'beland-crypto';

export const checkAuthMiddleware = function (ctx, next) {
  return _checkAuthMiddleware(ctx, next, getEntityId);
};

export const basicCheckAuthMiddleware = function (ctx, next) {
  return _checkAuthMiddleware(ctx, next, getBasicEntityId);
};

export const commonCheckAuthMiddleware = async function (ctx, next, entityId, token) {
  try {
    const authChain = JSON.parse(Buffer.from(token, 'base64').toString());
    if (authChain.length === 0) {
      throw Error('Invalid auth chain');
    }
    const user = authChain[0].payload;
    if (!user) {
      throw Error('Missing ETH address in auth chain');
    }
    const res = await Authenticator.validateSignature(entityId, authChain, null as any, Date.now());
    if (!res.ok) {
      ctx.body = { error: res.message };
      return;
    }
    ctx.state.user = { user: user.toLowerCase() };
  } catch (e) {
    ctx.body = { error: e.message };
    ctx.status = 400;
    return;
  }
  return next();
};

// utils
function getEntityId(ctx) {
  const data = {
    method: ctx.request.method.toLowerCase(),
    path: ctx.request.path.replace('/v1', ''),
    body: ctx.request.body,
  };
  return hashMessage(JSON.stringify(data));
}

function getBasicEntityId(ctx) {
  const path = ctx.request.path.replace('/v1', '');
  const method = ctx.request.method.toLowerCase();
  return `${method}:${path}`;
}

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

export const _checkAuthMiddleware = async function (ctx, next, getEntityIdFn) {
  const token = resolveAuthorizationHeader(ctx);
  if (!token) return;
  return commonCheckAuthMiddleware(ctx, next, getEntityIdFn(ctx), token)
};
