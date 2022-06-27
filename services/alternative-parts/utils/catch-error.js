let catchError = (func) => {
  return async (...args) => {
    try {
      return await func(...args);
    } catch (error) {
      console.log(error);
      return {};
    }
  };
};

module.exports = catchError;
