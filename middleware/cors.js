module.exports = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT,PATCH,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  return next();
};
