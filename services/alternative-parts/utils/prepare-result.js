const slugify = require("slugify");
const { compareTwoStrings: similarity } = require("string-similarity");

const sortParts = require("./sort-parts");
const filterParts = require("./filter-parts");

let prepareResult = (parts, config) => {
  const result = {};

  for (let part of parts) {
    let { name, description, number, price, shipping, from } = part;

    let brand = name;
    let type = description.split(" ")[0].toLowerCase();
    let key = slugify(`${brand} ${type}`, { lower: true });

    if (number === config.originalNumber) {
      key = "original";
      name = "Оригинал";
    }

    if (description?.match(/угол|углем/i)) name += ", угольный";
    name = shipping ? `${name} (Доставка ${shipping})` : name;
    price = price * 1.3;

    let isSimilarPart = ([_, part]) => part.brand === brand && similarity(part.type, type) > 0.5;
    let [similarKey, similarPart] = Object.entries(result).find(isSimilarPart) ?? [];
    let isSimilarCheaper = similarPart?.price <= price;

    if (!price || isSimilarCheaper) continue;

    result[similarKey ?? key] = { brand, name, description, type, number, price, from };
  }

  return sortParts(filterParts(result, config));
};

module.exports = prepareResult;
