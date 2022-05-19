const sortParts = require("./sort-parts");

let mergeParts = (target, ...sources) => {
  const result = { ...target };

  for (const source of sources) {
    for (let key in source) {
      if (!result[key] || source[key].price < result[key].price) result[key] = source[key];
    }
  }

  return sortParts(result);
};

module.exports = mergeParts;
