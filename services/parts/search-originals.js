const searchInRolf = require("./rolf");

const { mergeParts } = require("./utils");

let searchOriginals = async (numbers, config) => {
  // Запчасти из различных источников
  const [rolfParts] = await Promise.all([searchInRolf(numbers, config)]);

  // Объединение запчастей
  const result = mergeParts(rolfParts);
  return result;
};

module.exports = searchOriginals;
