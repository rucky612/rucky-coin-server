const types = require("./types");

const { GET_LATEST, GET_ALL, BC_RES } = types;

/* 
  this make like react-redux style
  all block chain socket server response action style like this:
  {
    type: "Some Text value"
    data: send block, data structure like this(is same blockchain structure):
    [
      {
        index: 0,
        hash: "wr31432424..."
        prevHash: "erewr3434..." or null,
        timestamp: new Date().getTime() / 1000,
        data: "any text in here"
      }
      ...
    ]
  }
*/

const getLatest = () => ({
  type: GET_LATEST,
  data: null
});

const getAll = () => ({
  type: GET_ALL,
  data: null
});

const bcResponse = data => ({
  type: BC_RES,
  data
});

module.exports = {
  getLatest,
  getAll,
  bcResponse
};
