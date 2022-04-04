module.exports = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  return next();
};
