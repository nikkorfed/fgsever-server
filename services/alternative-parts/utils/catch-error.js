const withTimeout = require("./timeout");

let catchError = (func) => {
  return async (...args) => {
    try {
      func = withTimeout(func, 15000);
      return await func(...args);
    } catch (error) {
      console.log(error);
      return {};
    }
  };
};

module.exports = catchError;
