import _ from 'lodash';
import { userList, userToggle, userUpsert } from '../../service/user.service';

export async function handleList(ctx) {
  ctx.body = await userList(ctx.query);
}

export async function handleUpsert(ctx) {
  ctx.body = await userUpsert(ctx.state.user.user, ctx.request.body);
}

export const handleBlockUsers = handleToggleFn('blocked');
export const handleMuteUsers = handleToggleFn('muted');

function handleToggleFn(field: string) {
  return async ctx => {
    const body = ctx.request.body;
    const user = ctx.state.user;
    ctx.body = await userToggle(user, body.userIds, body.enabled, field);
  };
}
