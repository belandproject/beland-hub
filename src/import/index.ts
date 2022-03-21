require('dotenv').config();
import cls from 'cls-hooked';
const namespace = cls.createNamespace('indexer');
const Sequelize = require('sequelize');
Sequelize.useCLS(namespace);

import { assertDatabaseConnectionOk } from '../setup';

function importWearables() {
    
}


async function start() {
  await assertDatabaseConnectionOk();
  await importWearables()
}

start();
