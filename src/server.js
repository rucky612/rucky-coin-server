const express = require("express");
bodyParser = require("body-parser");
morgan = require("morgan");
BlockChain = require("./blockchain");

const { getBlockChain, createNewBlock } = BlockChain;

const PORT = 3000;

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));

app.listen(PORT, () => console.log(`rucky-coin-server running on ${PORT}`));
