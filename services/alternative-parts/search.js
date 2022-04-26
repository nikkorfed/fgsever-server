const searchInShateM = require("./shate-m");
const searchInAutoEuro = require("./auto-euro");

const { mergeParts, filterParts } = require("./utils");

let search = async (number, config = {}) => {
  config.externalAnalogs = config.externalAnalogs ?? true;

  // Аналоги из различных источников
  const [shateMAnalogs, autoEuroAnalogs] = await Promise.all([searchInShateM(number), searchInAutoEuro(number)]);

  // Подготовка запчастей
  const analogs = mergeParts(shateMAnalogs, autoEuroAnalogs);
  const result = analogs;

  return result;
};

module.exports = search;
