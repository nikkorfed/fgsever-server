const slugify = require("slugify");
const sortParts = require("./sort-parts");
const filterParts = require("./filter-parts");

let prepareResult = (parts, config) => {
  const result = {};

  for (let part of parts) {
    let { name, description, number, price, shipping, from } = part;
    let key = slugify(`${name} ${number.replace(/\s/g, "")}`, { lower: true });

    if (number === config.originalNumber) {
      key = "original";
      name = "Оригинал";
    }

    if (description?.match(/угол|углем/i)) {
      name += ", угольный";
    }

    if (!price || result[key]) continue;

    result[key] = {
      name: shipping ? `${name} (Доставка ${shipping})` : name,
      description,
      number,
      price: price * 1.3,
      from,
    };
  }

  return sortParts(filterParts(result, config));
};

module.exports = prepareResult;
