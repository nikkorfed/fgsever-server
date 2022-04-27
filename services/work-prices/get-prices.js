const fs = require("fs/promises");

let getPrices = async (series) => {
  const prices = JSON.parse(await fs.readFile(__dirname + "/prices.json"));
  const result = series ? prices[series] : prices;
  return result;
};

module.exports = getPrices;
