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

// 처음 생성하는 블록
const genesisBlock = new Block(
  0,
  "E0E9589F700964303BFF8BA5E93EC27AB90772FB4BED930E4F2AF791013CA75B",
  null,
  15705221373411,
  "start block!"
);

// 블록체인, 최초 블럭을 넣은 상황
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
  // 현재 체인에 새로운 블록 추가
  addBlock(newBlock);
  return newBlock;
};

const getBlockHash = block =>
  createHash(block.index, block.prevHash, block.time, block.data);

// 블록의 구조 (각 프로퍼티 타입) 검증
const isStructureValid = block =>
  typeof block.index === "number" &&
  typeof block.hash === "string" &&
  typeof block.index === "number" &&
  typeof block.time === "string" &&
  typeof block.data === "string";

// 새로 생성된 블록 검증
const isBlockValid = (candidate, latest) => {
  // 생성된 블록의 프로퍼티 타입 검증
  if (!isStructureValid(candidate)) {
    console.log("the candidate block invalid structure");
    return false;
  }
  // 생성된 블록이 최근 인덱스와 맞지 않을 경우
  if (latest.index + 1 !== candidate.index) {
    console.log("the candidate block invalid index");
    return false;
  }
  // 생성된 블록의 이전 해쉬가 현재 해쉬와 맞지 않을 경우
  if (latest.hash !== candidate.prevHash) {
    console.log("the candidate block invalid prevHash");
    return false;
  }
  // 생성된 블록의 해쉬가 현재 내가 만든 해쉬와 다를 경우(다른 해쉬 함수를 쓴 경우)
  if (getBlockHash(candidate) !== candidate.hash) {
    console.log("the candidate block invalid create hash");
    return false;
  }
  return true;
};

// 체인 검증
isChainValid = chain => {
  const isGenesisValid = block =>
    JSON.stringify(block) == JSON.stringify(genesisBlock);
  // 새로 생성된 체인의 최초 블록이 rucky블록체인의 최초 블록과 다를 경우
  if (!isGenesisValid(chain[0])) {
    console.log("the candidateChain genesisBlock invalid");
    return false;
  }
  // 체인의 모든 블록이 유효한지 검증
  for (let i = 1; i < chain.length; i++) {
    if (!isBlockValid(chain[i], chain[i - 1])) {
      return false;
    }
  }
  return true;
};

// 새로운 체인이 현 체인보다 길고 유효하다면 교체하는 함수
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
