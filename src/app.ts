import Koa from 'koa';
import helmet from 'koa-helmet';
import body from 'koa-bodyparser';
import cors from '@koa/cors';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
require('dotenv').config();
import { assertDatabaseConnectionOk } from './setup';
const app = new Koa();
import router from './api/router';

// custom 401 handling
app.use(async (ctx, next) => {
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
});

app.use(conditional());
app.use(etag());
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(body());
app.use(router.middleware());

async function listen() {
  await assertDatabaseConnectionOk();
  const port = process.env.PORT || 5040;
  app.listen(port);
  console.log(`> nft-api running! (:${port})`);
}

listen();
