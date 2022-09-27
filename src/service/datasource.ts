import YAML from 'yaml';
import fs, { readdirSync } from 'fs';
import { ethers } from 'ethers';
import { kaiWeb3, web3 } from '../utils/web3';
import database from '../database';
const { template: Template } = database.models;
import { sync } from '../utils/sync';
import { syncLatestBlock } from '../utils/blockNumber';

export class Module {
  addresses = [];
  topics = [];
  handlers = {};
  sourceOfAddr = {};
  firstBlock = 0;
  endBlock = 0;
  name = '';

  constructor(name: string) {
    this.name = name;
  }

  start = async () => {
    this.init();
    await this.loadAllTemplateContract();
    sync(this);
  };

  init = () => {
    const sourceRaw = fs.readFileSync(`./src/mods/${this.name}/source.yaml`, 'utf8');
    const sourceConfig = YAML.parse(sourceRaw);
    sourceConfig.dataSources.map(dataSource => this.initDataSource(dataSource));
    sourceConfig.templates.map(template => this.initTemplate(template));
  };

  initDataSource = dataSource => {
    this.setFirstBlock(dataSource);
    this.mapSourceAddress(dataSource.source.address, dataSource.name);
    this.initTemplate(dataSource);
  };

  initTemplate = dataSource => {
    const abi = this.getAbi(dataSource);
    const mapping = this.getMapping(dataSource);
    for (let handler of dataSource.mapping.eventHandlers) {
      this.addHandler(dataSource, abi, mapping, handler);
    }
  };

  addHandler = (dataSource, abi, mapping, handler) => {
    if (!this.handlers[dataSource.name]) {
      this.handlers[dataSource.name] = {};
    }

    let iface = new ethers.utils.Interface(abi);
    let topic = iface.getEventTopic(handler.event);
    this.topics.push(topic);
    this.handlers[dataSource.name][topic] = buildHandlerFn(
      iface,
      handler.event,
      mapping[handler.handler]
    );
  };

  setEndBlock = (number: number) => {
    this.endBlock = number;
  };

  setFirstBlock = dataSource => {
    if (dataSource.source.startBlock < this.firstBlock || this.firstBlock === 0) {
      this.firstBlock = dataSource.source.startBlock;
    }
  };

  getMapping = dataSource => {
    return require(`../mods/${this.name}/` + dataSource.mapping.file.replace('./', ''));
  };

  mapSourceAddress = (addr, sourceName) => {
    if (!this.sourceOfAddr[addr]) {
      this.sourceOfAddr[addr] = [];
    }
    this.sourceOfAddr[addr].push(sourceName);
    this.addresses.push(addr);
  };

  getAbi = dataSource => {
    return fs.readFileSync(
      `./src/mods/${this.name}/` + dataSource.source.abi.replace('./', ''),
      'utf8'
    );
  };

  handleLogs = async logs => {
    for (let log of logs) {
      let moduleNames = this.sourceOfAddr[log.address];
      if (moduleNames) {
        for (let moduleName of moduleNames) {
          if (this.handlers[moduleName][log.topics[0]]) {
            await this.handlers[moduleName][log.topics[0]](log);
          }
        }
      }
    }
  };

  createTemplate = async (name: string, address: string, creationBlock) => {
    await Template.create({ address, name, creationBlock });
    this.mapSourceAddress(address, name);
    const filter = _getLogFilters(creationBlock, this.endBlock, Object.keys(this.handlers[name]), [
      address,
    ]);
    const logs = await web3.eth.getPastLogs(filter);
    await this.handleLogs(logs);
  };

  loadAllTemplateContract = async () => {
    const templates = await Template.findAll();
    for (var template of templates) {
      this.mapSourceAddress(template.address, template.name);
    }
  };

  getFirtBlockNumber = () => this.firstBlock;

  getLogFilters = (fromBlock, toBlock) => {
    return _getLogFilters(fromBlock, toBlock, this.topics, this.addresses);
  };
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

function _getLogFilters(fromBlock, toBlock, topics, address) {
  return {
    topics: [topics],
    fromBlock,
    toBlock,
    address,
  };
}

// init all modules

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

export async function initDataSource() {
  await syncLatestBlock();
  const moduleNames = getDirectories('./src/mods');
  for (let moduleName of moduleNames) {
    const module = new Module(moduleName);
    module.start();
  }
}
