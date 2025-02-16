const fs = require("fs/promises");

let preparePrices = (prices, normHour) => {
  for (const key in prices) {
    if (typeof prices[key] === "object") prices[key] = preparePrices(prices[key], normHour);
    else if (typeof prices[key] === "number" && prices[key] < 10) prices[key] = prices[key] * normHour;
  }

  return prices;
};

let getPrices = async (series) => {
  const input = JSON.parse(await fs.readFile(__dirname + "/prices.json"));
  const prices = preparePrices(input, input.normHour);

  const result = series ? prices[series] : prices;
  return result;
};

module.exports = getPrices;
