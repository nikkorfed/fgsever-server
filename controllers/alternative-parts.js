const { search, searchInShateM, searchInAutoEuro } = require("~/services/alternative-parts");

exports.search = async (req, res) => {
  const { from } = req.query;
  const { number } = req.params;
  let parts;

  if (!number) return res.send({ error: "no-part-number" });

  // TODO: Add config to searchIn...() functions for adjusting 'favoritesInTop' and 'externalAnalogs' options.
  if (!from) parts = await search(number);
  else if (from === "shate-m") parts = await searchInShateM(number);
  else if (from === "auto-euro") parts = await searchInAutoEuro(number);

  if (!parts || !Object.keys(parts).length) return res.send({ error: "no-alternatives" });
  return res.send(parts);
};
