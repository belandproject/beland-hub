require('dotenv').config();
import cls from 'cls-hooked';
const namespace = cls.createNamespace('indexer');
const Sequelize = require('sequelize');
Sequelize.useCLS(namespace);

import { syncLatestBlock } from './utils/blockNumber';
import * as datasourceService from './service/datasource';
import { sync } from './utils/sync';
import { assertDatabaseConnectionOk } from './setup';

async function start() {
  await assertDatabaseConnectionOk();
  await syncLatestBlock();
  await datasourceService.init();
  sync(datasourceService);
}

start();
