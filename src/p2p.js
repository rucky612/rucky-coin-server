const WS = require("ws");

const sockets = [];

const getSockets = () => sockets;

const connectSocket = socket => {
  sockets[sockets.length] = socket;
  socket.on("message", data => {
    console.log(data);
  });
  setTimeout(() => {
    socket.send("welcome");
  }, 3000);
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
  connectToPeers
};
