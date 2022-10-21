let partition = (object, callback) => {
  const truthy = {};
  const falsy = {};

  for (const key in object) {
    callback(object[key], key) ? (truthy[key] = object[key]) : (falsy[key] = object[key]);
  }

  return [truthy, falsy];
};

module.exports = partition;
