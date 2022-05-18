const slugify = require("slugify");
const filterParts = require("./filter-parts");

let prepareResult = (parts, config) => {
  const result = {};

  for (let part of parts) {
    let { name, description, number, price, shipping, from } = part;
    let key = number === config.originalNumber ? "original" : slugify(`${name} ${number}`, { lower: true });

    if (result[key]) continue;

    if (description?.match(/угол|углем/i)) {
      name += ", угольный";
    }

    result[key] = {
      name: shipping ? `${name} (Доставка ${shipping})` : name,
      description,
      number,
      price: price * 1.3,
      from,
    };
  }

  return filterParts(result, config);
};

module.exports = prepareResult;
