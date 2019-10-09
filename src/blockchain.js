const CryptoJS = require("crypto-js");

class Block {
  constructor(index, hash, prevHash, timestamp, data) {
    this.index = index;
    this.hash = hash;
    this.prevHash = prevHash;
    this.timestamp = timestamp;
    this.data = data;
  }
}

const genesisBlock = new Block(
  0,
  "2C4CEB90344F20CC4C77D626247AED3ED530C1AEE3E6E85AD494498B17414CAC",
  null,
  1520312194926 / 1000,
  "This is the genesis!!"
);

let blockchain = [genesisBlock];

const getLatestBlock = () => blockchain[blockchain.length - 1];

const getTimestamp = () => new Date().getTime() / 1000;

const getBlockChain = () => blockchain;

const createHash = (index, prevHash, timestamp, data) =>
  CryptoJS.SHA256(
    index + prevHash + timestamp + JSON.stringify(data)
  ).toString();

const createNewBlock = data => {
  const previousBlock = getLatestBlock();
  const newBlockIndex = previousBlock.index + 1;
  const newTimestamp = getTimestamp();
  const newHash = createHash(
    newBlockIndex,
    previousBlock.hash,
    newTimestamp,
    data
  );
  const newBlock = new Block(
    newBlockIndex,
    newHash,
    previousBlock.hash,
    newTimestamp,
    data
  );
  // 새 블록을 현 체인에 더하고
  addBlock(newBlock);
  // 모든 p2p 서버에 새 블록으로 업데이트한다
  require("./p2p").broadcastNewBlock();
  return newBlock;
};

const getBlocksHash = block =>
  createHash(block.index, block.prevHash, block.timestamp, block.data);

// 블록 유효성 검증
const isBlockValid = (candidateBlock, latestBlock) => {
  // 블록의 각 프로퍼티 자료형 검증
  if (!isStructureValid(candidateBlock)) {
    console.log("The candidate block structure is not valid");
    return false;
    // 블록의 인덱스 검증
  } else if (latestBlock.index + 1 !== candidateBlock.index) {
    console.log("The candidate block doesnt have a valid index");
    return false;
    // 생성된 블록의 이전 해쉬가 현 블록의 해쉬와 맞는지
  } else if (latestBlock.hash !== candidateBlock.prevHash) {
    console.log(
      "The prevHash of the candidate block is not the hash of the latest block"
    );
    return false;
    //블록의 해쉬 검증
  } else if (getBlocksHash(candidateBlock) !== candidateBlock.hash) {
    console.log("The hash of this block is invalid");
    return false;
  }
  return true;
};

// 자료형 검증
const isStructureValid = block =>
  typeof block.index === "number" &&
  typeof block.hash === "string" &&
  typeof block.prevHash === "string" &&
  typeof block.timestamp === "number" &&
  typeof block.data === "string";

const isChainValid = candidateChain => {
  const isGenesisValid = block => {
    return JSON.stringify(block) === JSON.stringify(genesisBlock);
  };
  // 최초 시작 블록 검증
  if (!isGenesisValid(candidateChain[0])) {
    console.log(
      "The candidateChains's genesisBlock is not the same as our genesisBlock"
    );
    return false;
  }
  // 모든 블록을 돌면서 블록 유효성 검증
  for (let i = 1; i < candidateChain.length; i++) {
    if (!isBlockValid(candidateChain[i], candidateChain[i - 1])) {
      return false;
    }
  }
  return true;
};

const replaceChain = candidateChain => {
  if (
    isChainValid(candidateChain) &&
    candidateChain.length > getBlockChain().length
  ) {
    blockchain = candidateChain;
    return true;
  } else {
    return false;
  }
};

const addBlock = candidateBlock => {
  if (isBlockValid(candidateBlock, getLatestBlock())) {
    blockchain.push(candidateBlock);
    return true;
  } else {
    return false;
  }
};

module.exports = {
  getLatestBlock,
  getBlockChain,
  createNewBlock,
  isStructureValid,
  addBlock,
  replaceChain
};
