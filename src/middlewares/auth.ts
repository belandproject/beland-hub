import { hashMessage } from 'ethers/lib/utils';
import { Authenticator } from 'dcl-crypto';

const TYPE_BASIC = 'basic';

export const checkAuthMiddleware = async function (ctx, next) {
  return _checkAuthMiddleware(ctx, next, '');
};

export const basicCheckAuthMiddleware = async function (ctx, next) {
  return _checkAuthMiddleware(ctx, next, TYPE_BASIC);
};

export const commonCheckAuthMiddleware = async function (ctx, next, entityId, token) {
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
  ctx.state.user = { user };
  next();
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

export const _checkAuthMiddleware = async function (ctx, next, type) {
  const token = resolveAuthorizationHeader(ctx);
  if (!token) return;
  try {
    const entityId = type == TYPE_BASIC ? getBasicEntityId(ctx) : getEntityId(ctx);
    return commonCheckAuthMiddleware(ctx, next, entityId, token);
  } catch (e) {
    ctx.body = { error: 'Invalid token' };
    return;
  }
};
