const searchInShateM = require("./shate-m");
const searchInAutoEuro = require("./auto-euro");

const { mergeParts, filterParts } = require("./utils");

let search = async (number, config = {}) => {
  config.externalAnalogs = config.externalAnalogs ?? true;
  config.onlyFavorites = config.onlyFavorites ?? false;

  // Аналоги из различных источников
  const [shateMAnalogs, autoEuroAnalogs] = await Promise.all([searchInShateM(number, config), searchInAutoEuro(number, config)]);

  // Подготовка запчастей
  const result = mergeParts(shateMAnalogs, autoEuroAnalogs);
  return result;
};

module.exports = search;
