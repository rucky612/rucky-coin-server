const WS = require("ws");
BlockChain = require("./blockchain");
actions = require("./actions");
types = require("./types");

const {
  getLatestBlock,
  getBlockChain,
  isBlockValid,
  isStructureValid,
  addBlock,
  replaceChain
} = BlockChain;
const { GET_LATEST, GET_ALL, BC_RES } = types;
const { getLatest, getAll, bcResponse } = actions;

const sockets = [];

const getSockets = () => sockets;

const parseData = data => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const sendMsg = (ws, msg) => ws.send(JSON.stringify(msg));

const sendMsgToAll = msg => sockets.forEach(ws => sendMsg(ws, msg));

const resLatest = () => bcResponse([getLatestBlock()]);

const resAll = () => bcResponse(getBlockChain());

const broadcastNewBlock = () => sendMsgToAll(resLatest());

// 연결된 소캣이 메시지를 받을시 행할 액션을 관리하는 함수
const handleMsg = ws => {
  ws.on("message", data => {
    const msg = parseData(data);
    if (msg === null) {
      return;
    }
    console.log(msg);
    // 각 소캣들이 받을 액션에 따라 분기처리
    switch (msg.type) {
      case GET_LATEST:
        sendMsg(ws, resLatest());
        break;
      case GET_ALL:
        sendMsg(ws, resAll());
        break;
      case BC_RES:
        const resBlocks = msg.data;
        if (resBlocks === null) {
          break;
        }
        handleBCRes(resBlocks);
        break;
    }
  });
};

const handleBCRes = receiveBlocks => {
  const latestReceived = receiveBlocks[receiveBlocks.length - 1];
  const newestBlock = getLatestBlock();
  if (receiveBlocks.length === 0) {
    console.log("Received blocks have a length of 0");
    return;
  }
  if (!isStructureValid(latestReceived)) {
    console.log("the block structure of block received is invalid");
    return;
  }
  // 다른 소캣 서버에서 받은 블록의 인덱스가 가장 최근 블록 인덱스보다 크다면
  if (latestReceived.index > newestBlock.index) {
    // 최근 블록 해쉬가 받은 블록의 이전 해쉬와 같다면 받은 해쉬가 1개 더 많은 것이므로
    // 블록을 현 체인에 더하면 된다.
    if (newestBlock.hash === latestReceived.prevHash) {
      if (addBlock(latestReceived)) {
        broadcastNewBlock();
      }
      // 받은 블록의 길이가 1개라면 모든 소캣에게 현 체인으로 업데이트한다.
    } else if (receiveBlocks.length === 1) {
      sendMsgToAll(getAll());
    } else {
      replaceChain(receiveBlocks);
    }
  }
};

// 소캣 에러 발생시, 해당 서버를 닫는 함수
const handleError = ws => {
  const closeSocketConnection = ws => {
    ws.close();
    sockets.splice(sockets.indexOf(ws), 1);
  };
  ws.on("close", () => closeSocketConnection(ws));
  ws.on("error", () => closeSocketConnection(ws));
};

const connectSocket = ws => {
  sockets[sockets.length] = ws;
  handleMsg(ws);
  handleError(ws);
  //
  sendMsg(ws, getLatest());
};

// 최초 서버간 통신을 시작하는 함수
const startP2PServer = server => {
  const wsServer = new WS.Server({ server });
  wsServer.on("connection", ws => {
    connectSocket(ws);
  });
  console.log("P2P server is running!");
};

// 새로운 서버가 들어올 때 소캣과 연결시키는 함수
const connectToPeers = newPeer => {
  const ws = new WS(newPeer);
  ws.on("open", () => {
    connectSocket(ws);
  });
};

module.exports = {
  startP2PServer,
  connectToPeers,
  broadcastNewBlock
};
