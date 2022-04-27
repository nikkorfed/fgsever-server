const { getPrices } = require("~/services/work-prices");

exports.getPrices = async (req, res) => {
  const prices = await getPrices();
  return res.send(prices);
};

exports.getPricesForSeries = async (req, res) => {
  const { series } = req.params;

  const prices = await getPrices(series);
  if (!prices) return res.send({ error: "non-existing-series" });

  return res.send(prices);
};
