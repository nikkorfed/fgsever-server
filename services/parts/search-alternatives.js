const searchInShateM = require("./shate-m");
const searchInAutoEuroAPI = require("./auto-euro-api");
const searchInArmtekAPI = require("./armtek-api");
const searchInAutoVision = require("./auto-vision");

const { mergeParts } = require("./utils");

let searchAlternatives = async (number, config) => {
  // Запчасти из различных источников
  const [shateMParts, autoEuroParts, armtekParts] = await Promise.all([
    // searchInShateM(number, config),
    searchInAutoEuroAPI(number, config),
    searchInArmtekAPI(number, config),
    // searchInAutoVision(number, config),
  ]);

  // Объединение запчастей
  const result = mergeParts(shateMParts, autoEuroParts, armtekParts);
  return result;
};

module.exports = searchAlternatives;
