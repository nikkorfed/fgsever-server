const {
  searchOriginals,
  searchAlternatives,
  searchInRolf,
  searchInMajorAuto,
  searchInMajorAutoAPI,
  searchInShateM,
  searchInAutoEuro,
  searchInAutoEuroAPI,
  searchInArmtek,
  searchInArmtekAPI,
  searchInAutoVision,
} = require("../services/parts");

exports.searchOriginals = async (req, res) => {
  const { from, ...config } = req.query;
  const { numbers } = req.params;

  if (!numbers) return res.send({ error: "no-part-numbers" });

  let parts;
  if (!from) parts = await searchOriginals(numbers, config);
  else if (from === "rolf") parts = await searchInRolf(numbers, config);
  else if (from === "majorauto") parts = await searchInMajorAuto(numbers, config);
  else if (from === "majorautoapi") parts = await searchInMajorAutoAPI(numbers, config);

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
  else if (from === "autoeuroapi") parts = await searchInAutoEuroAPI(number, config);
  else if (from === "armtek") parts = await searchInArmtek(number, config);
  else if (from === "armtekapi") parts = await searchInArmtekAPI(number, config);
  // else if (from === "autovision") parts = await searchInAutoVision(number, config);

  if (!parts || !Object.keys(parts).length) return res.send({ error: "no-parts" });
  return res.send(parts);
};
