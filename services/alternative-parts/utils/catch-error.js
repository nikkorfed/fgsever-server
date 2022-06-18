let catchError = (func) => {
  return async (...args) => {
    try {
      await func(...args);
    } catch (error) {
      console.log(error);
      return {};
    }
  };
};

module.exports = catchError;
