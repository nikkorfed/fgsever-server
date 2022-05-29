const searchInShateM = require("./shate-m");
const searchInAutoEuro = require("./auto-euro");
const searchInArmtek = require("./armtek");

const { mergeParts } = require("./utils");

let search = async (number, config) => {
  // Запчасти из различных источников
  const [shateMParts, autoEuroParts, armtekParts] = await Promise.all([
    searchInShateM(number, config),
    searchInAutoEuro(number, config),
    searchInArmtek(number, config),
  ]);

  // Объединение запчастей
  const result = mergeParts(shateMParts, autoEuroParts, armtekParts);
  return result;
};

module.exports = search;
