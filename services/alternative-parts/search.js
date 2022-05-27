const searchInShateM = require("./shate-m");
const searchInAutoEuro = require("./auto-euro");
const searchInArmtek = require("./armtek");

const { mergeParts } = require("./utils");

let search = async (number, config = {}) => {
  // Аналоги из различных источников
  const [shateMAnalogs, autoEuroAnalogs] = await Promise.all([
    searchInShateM(number, config),
    searchInAutoEuro(number, config),
    searchInArmtek(number, config),
  ]);

  // Подготовка запчастей
  const result = mergeParts(shateMAnalogs, autoEuroAnalogs);
  return result;
};

module.exports = search;
