let withTimeout = (func, ms) => {
  return async (...args) =>
    new Promise((resolve, reject) => {
      let timerId = setTimeout(() => reject("Таймаут!"), ms);
      func(...args)
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timerId));
    });
};

module.exports = withTimeout;
