export async function errorsMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.body = {
        error: 'Unauthentication',
      };
    } else {
      throw err;
    }
  }
}
