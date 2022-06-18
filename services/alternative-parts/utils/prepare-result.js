const slugify = require("slugify");

const sortParts = require("./sort-parts");
const filterParts = require("./filter-parts");
const findSimilarPart = require("./similar-part");

let prepareResult = (parts, config) => {
  const result = {};

  for (let part of parts) {
    let { name, description, number, price, shipping, from } = part;

    let brand = name;
    let type = description?.split(" ")[0].toLowerCase();
    let key = slugify(`${brand} ${type ?? ""}`, { lower: true });

    if (number === config.originalNumber) {
      key = "original";
      name = "Оригинал";
    }

    if (description?.match(/угол|углем/i)) name += ", угольный";
    name = shipping ? `${name} (${shipping})` : name;
    price = price * 1.3;

    let [_, similarPart] = findSimilarPart(result, { brand, type, number });
    if (!price || similarPart) continue;

    result[key] = { brand, name, description, type, number, price, from };
  }

  return sortParts(filterParts(result, config));
};

module.exports = prepareResult;
