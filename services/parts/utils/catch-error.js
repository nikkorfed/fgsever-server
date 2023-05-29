const withTimeout = require("./timeout");

let catchError = (func, browserRef) => {
  return async (...args) => {
    try {
      func = withTimeout(func, 15000);
      return await func(...args);
    } catch (error) {
      console.log(error);
      await browserRef?.instance?.close();
      return {};
    }
  };
};

module.exports = catchError;
