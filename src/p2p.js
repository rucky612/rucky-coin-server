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

// ����� ��Ĺ�� �޽����� ������ ���� �׼��� �����ϴ� �Լ�
const handleMsg = ws => {
  ws.on("message", data => {
    const msg = parseData(data);
    if (msg === null) {
      return;
    }
    console.log(msg);
    // �� ��Ĺ���� ���� �׼ǿ� ���� �б�ó��
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
  // �ٸ� ��Ĺ �������� ���� ����� �ε����� ���� �ֱ� ��� �ε������� ũ�ٸ�
  if (latestReceived.index > newestBlock.index) {
    // �ֱ� ��� �ؽ��� ���� ����� ���� �ؽ��� ���ٸ� ���� �ؽ��� 1�� �� ���� ���̹Ƿ�
    // ����� �� ü�ο� ���ϸ� �ȴ�.
    if (newestBlock.hash === latestReceived.prevHash) {
      if (addBlock(latestReceived)) {
        broadcastNewBlock();
      }
      // ���� ����� ���̰� 1����� ��� ��Ĺ���� �� ü������ ������Ʈ�Ѵ�.
    } else if (receiveBlocks.length === 1) {
      sendMsgToAll(getAll());
    } else {
      replaceChain(receiveBlocks);
    }
  }
};

// ��Ĺ ���� �߻���, �ش� ������ �ݴ� �Լ�
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

// ���� ������ ����� �����ϴ� �Լ�
const startP2PServer = server => {
  const wsServer = new WS.Server({ server });
  wsServer.on("connection", ws => {
    connectSocket(ws);
  });
  console.log("P2P server is running!");
};

// ���ο� ������ ���� �� ��Ĺ�� �����Ű�� �Լ�
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
