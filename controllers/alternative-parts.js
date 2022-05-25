const { search, searchInShateM, searchInAutoEuro, searchInArmtek } = require("~/services/alternative-parts");

exports.search = async (req, res) => {
  const { from, ...config } = req.query;
  const { number } = req.params;

  if (!number) return res.send({ error: "no-part-number" });

  let parts;
  if (!from) parts = await search(number, config);
  else if (from === "shatem") parts = await searchInShateM(number, config);
  else if (from === "autoeuro") parts = await searchInAutoEuro(number, config);
  else if (from === "armtek") parts = await searchInArmtek(number, config);

  if (!parts || !Object.keys(parts).length) return res.send({ error: "no-alternatives" });
  return res.send(parts);
};
