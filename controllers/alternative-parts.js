const { searchInShateM, searchInAutoEuro } = require("~/services/alternative-parts");

exports.search = async (req, res) => {
  const { from } = req.query;
  const { number } = req.params;
  let parts;

  if (!number) return res.send({ error: "no-part-number" });

  // TODO: Add config to searchIn...() functions for adjusting 'favoritesInTop' and 'externalAnalogs' options.
  if (!from || from === "shatem") parts = await searchInShateM(number);
  else if (from === "autoeuro") parts = await searchInAutoEuro(number);

  if (!parts || !Object.keys(parts).length) return res.send({ error: "no-alternatives" });
  return res.send(parts);
};
