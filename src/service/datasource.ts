import { ethers } from 'ethers';
import fs, { readdirSync } from 'fs';
import YAML from 'yaml';
import { kaiWeb3, web3 } from '../utils/web3';
import database from '../database';
const { template: Template } = database.models;

var addresses = [];
var topics = [];
var handlers = {};
var sourceOfAddr = {};
var firstBlock = 0;
var endBlock;
export function getFirtBlockNumber() {
  return firstBlock;
}

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

function getAbi(module, dataSource) {
  return fs.readFileSync(`./src/mods/${module}/` + dataSource.source.abi.replace('./', ''), 'utf8');
}

export async function init() {
  const moduleNames = getDirectories('./src/mods');
  moduleNames.map(initModule);
  await loadAllTemplateContract();
}

function buildHandlerFn(iface, eventName, handleFn) {
  return function (log) {
    const args = iface.decodeEventLog(eventName, log.data, log.topics);
    const e = {
      args,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      address: log.address,
      event: eventName,
      transactionHash: log.transactionHash,
      getTransaction: () => {
        return kaiWeb3.getTransaction(log.transactionHash);
      },
    };
    return handleFn(e);
  };
}

function addHandler(dataSource, abi, mapping, handler) {
  if (!handlers[dataSource.name]) {
    handlers[dataSource.name] = {};
  }

  let iface = new ethers.utils.Interface(abi);
  let topic = iface.getEventTopic(handler.event);
  topics.push(topic);
  handlers[dataSource.name][topic] = buildHandlerFn(iface, handler.event, mapping[handler.handler]);
}

function addSourceOfAddress(addr, sourceName) {
  if (!sourceOfAddr[addr]) {
    sourceOfAddr[addr] = [];
  }
  sourceOfAddr[addr].push(sourceName);
  addresses.push(addr);
}

function setFirstBlock(dataSource) {
  if (dataSource.source.startBlock < firstBlock || firstBlock === 0) {
    firstBlock = dataSource.source.startBlock;
  }
}

function initDataSource(moduleName, dataSource) {
  setFirstBlock(dataSource);
  addSourceOfAddress(dataSource.source.address, dataSource.name);
  initTemplate(moduleName, dataSource);
}

function getMapping(moduleName: string, dataSource) {
  return require(`../mods/${moduleName}/` + dataSource.mapping.file.replace('./', ''));
}

function initTemplate(moduleName, dataSource) {
  const abi = getAbi(moduleName, dataSource);
  const mapping = getMapping(moduleName, dataSource);
  for (let handler of dataSource.mapping.eventHandlers) {
    addHandler(dataSource, abi, mapping, handler);
  }
}

function initModule(moduleName) {
  const sourceRaw = fs.readFileSync(`./src/mods/${moduleName}/source.yaml`, 'utf8');
  const sourceConfig = YAML.parse(sourceRaw);
  sourceConfig.dataSources.map(dataSource => initDataSource(moduleName, dataSource));
  sourceConfig.templates.map(template => initTemplate(moduleName, template));
}

export function getLogFilters(fromBlock, toBlock) {
  return _getLogFilters(fromBlock, toBlock, topics, addresses);
}

function _getLogFilters(fromBlock, toBlock, topics, address) {
  return {
    topics: [topics],
    fromBlock,
    toBlock,
    address,
  };
}

async function loadAllTemplateContract() {
  const templates = await Template.findAll();
  for (var template of templates) {
    addSourceOfAddress(template.address, template.name);
  }
}

export async function createTemplate(name: string, address: string, creationBlock) {
  await Template.create({ address, name, creationBlock });
  addSourceOfAddress(address, name);
  const filter = _getLogFilters(creationBlock, endBlock, Object.keys(handlers[name]), [address]);
  const logs = await web3.eth.getPastLogs(filter);
  await handleLogs(logs);
}

export async function handleLogs(logs) {
  for (let log of logs) {
    let moduleNames = sourceOfAddr[log.address];
    if (moduleNames) {
      for (let moduleName of moduleNames) {
        await handlers[moduleName][log.topics[0]](log);
      }
    }
  }
}

export function setEndBlock(number: number) {
  endBlock = number;
}
