const searchInShateM = require("./shate-m");
const searchInAutoEuro = require("./auto-euro");
const searchInArmtek = require("./armtek");
const searchInAutoVision = require("./auto-vision");

const { mergeParts } = require("./utils");

let search = async (number, config) => {
  // Запчасти из различных источников
  const [shateMParts, autoEuroParts, armtekParts, autoVisionParts] = await Promise.all([
    searchInShateM(number, config),
    searchInAutoEuro(number, config),
    searchInArmtek(number, config),
    searchInAutoVision(number, config),
  ]);

  // Объединение запчастей
  const result = mergeParts(shateMParts, autoEuroParts, armtekParts, autoVisionParts);
  return result;
};

module.exports = search;
