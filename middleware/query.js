module.exports = (req, res, next) => {
  for (const param in req.query) {
    if (req.query[param] === "true") req.query[param] = true;
    else if (req.query[param] === "false") req.query[param] = false;
  }
  return next();
};
