const express = require("express");
bodyParser = require("body-parser");
morgan = require("morgan");
BlockChain = require("./blockchain");
P2P = require("./p2p");

const { getBlockChain, createNewBlock } = BlockChain;
const { startP2PServer, connectToPeers } = P2P;

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));

app.get("/blocks", (req, res) => {
  res.send(getBlockChain());
});

app.post("/blocks", (req, res) => {
  const { data } = req.body;
  const newBlock = createNewBlock(data);
  res.send(newBlock);
});

app.post("/peers", (req, res) => {
  const { peer } = req.body;
  connectToPeers(peer);
  res.send("success");
});

const server = app.listen(PORT, () =>
  console.log(`rucky-coin-server running on ${PORT}`)
);

startP2PServer(server);
