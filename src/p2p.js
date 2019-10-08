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
  connectToPeers
};
