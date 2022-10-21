const partition = require("./partition");

let sortParts = (parts) => {
  const [original, others] = partition(parts, (_, key) => key === "original");
  parts = { ...original, ...others };

  return parts;
};

module.exports = sortParts;
