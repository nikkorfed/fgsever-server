const sortParts = require("./sort-parts");
const findSimilarPart = require("./similar-part");

let mergeParts = (target, ...sources) => {
  const result = { ...target };

  for (const source of sources) {
    for (let key in source) {
      let [similarKey, similarPart] = findSimilarPart(result, source[key]);
      if (!similarPart || source[key].price < similarPart.price) result[similarKey ?? key] = source[key];
    }
  }

  return sortParts(result);
};

module.exports = mergeParts;
