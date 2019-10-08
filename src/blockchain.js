const Crypto = require("crypto-js");

class Block {
  constructor(index, hash, prevHash, time, data) {
    this.index = index;
    this.hash = hash;
    this.prevHash = prevHash;
    this.time = time;
    this.data = data;
  }
}

// ó�� �����ϴ� ���
const genesisBlock = new Block(
  0,
  "E0E9589F700964303BFF8BA5E93EC27AB90772FB4BED930E4F2AF791013CA75B",
  null,
  15705221373411,
  "start block!"
);

// ���ü��, ���� ���� ���� ��Ȳ
let blockchain = [genesisBlock];

const getLastBlock = () => blockchain[blockchain.length - 1];

const getTimeStamp = () => new Date().getTime() / 1000;

const getBlockChain = () => blockchain;

const createHash = (index, prevHash, time, data) =>
  Crypto.SHA256(index + prevHash + time + JSON.stringify(data)).toString();

const createNewBlock = data => {
  const prevBlock = getLastBlock();
  const newBlockIndex = prevBlock.index + 1;
  const newTimestamp = getTimeStamp();
  const newHash = createHash(newBlockIndex, prevBlock.hash, newTimestamp, data);
  const newBlock = new Block(
    newBlockIndex,
    newHash,
    prevBlock.hash,
    newTimestamp,
    data
  );
  // ���� ü�ο� ���ο� ��� �߰�
  addBlock(newBlock);
  return newBlock;
};

const getBlockHash = block =>
  createHash(block.index, block.prevHash, block.time, block.data);

// ����� ���� (�� ������Ƽ Ÿ��) ����
const isStructureValid = block =>
  typeof block.index === "number" &&
  typeof block.hash === "string" &&
  typeof block.index === "number" &&
  typeof block.time === "string" &&
  typeof block.data === "string";

// ���� ������ ��� ����
const isBlockValid = (candidate, latest) => {
  // ������ ����� ������Ƽ Ÿ�� ����
  if (!isStructureValid(candidate)) {
    console.log("the candidate block invalid structure");
    return false;
  }
  // ������ ����� �ֱ� �ε����� ���� ���� ���
  if (latest.index + 1 !== candidate.index) {
    console.log("the candidate block invalid index");
    return false;
  }
  // ������ ����� ���� �ؽ��� ���� �ؽ��� ���� ���� ���
  if (latest.hash !== candidate.prevHash) {
    console.log("the candidate block invalid prevHash");
    return false;
  }
  // ������ ����� �ؽ��� ���� ���� ���� �ؽ��� �ٸ� ���(�ٸ� �ؽ� �Լ��� �� ���)
  if (getBlockHash(candidate) !== candidate.hash) {
    console.log("the candidate block invalid create hash");
    return false;
  }
  return true;
};

// ü�� ����
isChainValid = chain => {
  const isGenesisValid = block =>
    JSON.stringify(block) == JSON.stringify(genesisBlock);
  // ���� ������ ü���� ���� ����� rucky���ü���� ���� ��ϰ� �ٸ� ���
  if (!isGenesisValid(chain[0])) {
    console.log("the candidateChain genesisBlock invalid");
    return false;
  }
  // ü���� ��� ����� ��ȿ���� ����
  for (let i = 1; i < chain.length; i++) {
    if (!isBlockValid(chain[i], chain[i - 1])) {
      return false;
    }
  }
  return true;
};

// ���ο� ü���� �� ü�κ��� ��� ��ȿ�ϴٸ� ��ü�ϴ� �Լ�
const replaceChain = newChain => {
  if (isChainValid(newChain) && newChain.length > getBlockChain().length) {
    blockchain = newChain;
    return true;
  }
  return false;
};

const addBlock = newBlock => {
  if (isBlockValid(newBlock, getLastBlock())) {
    const chain = getBlockChain();
    chain[chain.length] = newBlock;
    return true;
  }
  return false;
};

module.exports = {
  getBlockChain,
  createNewBlock
};
