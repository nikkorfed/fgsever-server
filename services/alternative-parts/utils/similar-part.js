const { compareTwoStrings: similarity } = require("string-similarity");

let findSimilarPart = (result, { brand, type, number }) => {
  let isSimilarPart = ([_, part]) => {
    if (part.number.replace(/[\s-]/g, "") === number.replace(/[\s-]/g, "")) return true;
    if (part.brand !== brand) return false;
    if (synonyms(part.type, type) || similarity(part.type, type) > 0.5) return true;
    return false;
  };

  let similarPart = Object.entries(result).find(isSimilarPart) ?? [];
  return similarPart;
};

// TODO: Use full description for comparing. Firstly, check the similarity of first words. Then, check if both strings start with synonyms.
let synonyms = (first, second) => {
  const pairs = [["колодки", "комплект"]];
  return pairs.some((pair) => pair.includes(first) && pair.includes(second));
};

module.exports = findSimilarPart;
