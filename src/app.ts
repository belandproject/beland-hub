require('dotenv').config();
import Koa from 'koa';
import helmet from 'koa-helmet';
import body from 'koa-bodyparser';
import cors from '@koa/cors';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import cls from 'cls-hooked';
const namespace = cls.createNamespace('server');
const Sequelize = require('sequelize');
Sequelize.useCLS(namespace);

import { assertDatabaseConnectionOk } from './setup';
const app = new Koa();
import router from './api/router';
import { errorsMiddleware } from './middlewares/errors';
import { INDEXER } from './constants';
import { initDataSource } from './service/datasource';

app.use(errorsMiddleware);
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

async function startIndexer() {
  initDataSource()
}

function start() {
  listen();

  if (INDEXER) {
    startIndexer();
  }
}

start();
