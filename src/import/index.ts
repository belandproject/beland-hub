require('dotenv').config();
import cls from 'cls-hooked';
const namespace = cls.createNamespace('indexer');
const Sequelize = require('sequelize');
Sequelize.useCLS(namespace);
import waerables from './wearables.json';
import { assertDatabaseConnectionOk } from '../setup';
import database from '../database';

const { item: Item } = database.models;

async function importWearables() {
  for (var waerable of waerables) {
    await Item.upsert({
      ...waerable,
      pricePerUnit: '0',
      onSale: false,
      quoteToken: '',
      creator: '0x',
      maxSupply: '0',
      totalSupply: '0',
      isPublished: true,
      tokenURI: '',
      tokenAddress: 'urn:beland:off-chain:base-avatars',
    });
  }
}

async function start() {
  await assertDatabaseConnectionOk();
  await importWearables();
}

start();
