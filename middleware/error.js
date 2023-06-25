module.exports = (err, req, res, next) => {
  console.log(err);
  return res.status(500).json({ error: "Произошла внутренняя ошибка сервера." });
};
