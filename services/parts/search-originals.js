const searchInRolf = require("./rolf");
const searchInMajorAuto = require("./major-auto");

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
