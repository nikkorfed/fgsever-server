const slugify = require("slugify");

const sortParts = require("./sort-parts");
const filterParts = require("./filter-parts");
const findSimilarPart = require("./similar-part");

let prepareResult = (parts, config) => {
  const result = {};

  if (config.searchOriginals) config.searchOriginals.map((number) => (result[number] = { number }));

  for (let part of parts) {
    let { name, description, number, price, shipping, available, from } = part;
    if (!number || !price) continue;
    if (config.skipNotAvailable && !available) continue;

    let brand = name;
    let type = description?.split(" ")[0].toLowerCase();
    let key = config.searchOriginals ? number : slugify(`${brand} ${type ?? ""}`, { lower: true, strict: true });

    if (number === config.originalNumber) {
      key = "original";
      name = "Оригинал";
    }

    if (description?.match(/угол|углем/i)) name += ", угольный";
    name = shipping ? `${name} (Доставка ${from === "auto-vision" ? "из Германии " : ""}${shipping})` : name;
    price = price * 1.3;

    let [_, similarPart] = findSimilarPart(result, { brand, type, number });
    if (!config.searchOriginals && similarPart) continue;

    result[key] = { ...result[key], brand, name, description, type, number, price, from };
  }

  return sortParts(filterParts(result, config));
};

module.exports = prepareResult;
