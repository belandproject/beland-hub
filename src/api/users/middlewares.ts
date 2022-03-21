import database from '../../database';
const { user: User} = database.models;

export async function getUserAuthMiddleware(ctx, next) {
    const auth = ctx.state.user;
    const user = await User.findByPk(auth.user);
    if (!user) {
      ctx.body = { error: 'User not found' };
      return;
    }
    ctx.state.user = user;
    next()
}