const searchInRolf = require("./rolf");
const searchInMajorAuto = require("./major-auto");
const searchInMajorAutoAPI = require("./major-auto-api");

const { mergeParts } = require("./utils");

let searchOriginals = async (numbers, config) => {
  // Запчасти из различных источников
  const [rolfParts, majorAutoParts] = await Promise.all([
    // searchInRolf(numbers, config),
    searchInMajorAuto(numbers, config),
  ]);

  // Объединение запчастей
  const result = mergeParts(rolfParts, majorAutoParts);
  return result;
};

module.exports = searchOriginals;
