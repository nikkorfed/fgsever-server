const {
  searchOriginals,
  searchAlternatives,
  searchInRolf,
  searchInShateM,
  searchInAutoEuro,
  searchInArmtek,
  searchInAutoVision,
} = require("~/services/parts");

exports.searchOriginals = async (req, res) => {
  const { from, ...config } = req.query;
  const { numbers } = req.params;

  if (!numbers) return res.send({ error: "no-part-numbers" });

  let parts;
  if (!from) parts = await searchOriginals(numbers, config);
  else if (from === "rolf") parts = await searchInRolf(number, config);

  if (!parts || !Object.keys(parts).length) return res.send({ error: "no-parts" });
  return res.send(parts);
};

exports.searchAlternatives = async (req, res) => {
  const { from, ...config } = req.query;
  const { number } = req.params;

  if (!number) return res.send({ error: "no-part-number" });

  let parts;
  if (!from) parts = await searchAlternatives(number, config);
  else if (from === "shatem") parts = await searchInShateM(number, config);
  else if (from === "autoeuro") parts = await searchInAutoEuro(number, config);
  else if (from === "armtek") parts = await searchInArmtek(number, config);
  // else if (from === "autovision") parts = await searchInAutoVision(number, config);

  if (!parts || !Object.keys(parts).length) return res.send({ error: "no-parts" });
  return res.send(parts);
};
