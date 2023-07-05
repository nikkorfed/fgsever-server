const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

exports.employee = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Доступ запрещён. Токен не предоставлен." });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "employee") return res.status(403).send({ message: "Доступ запрещён. Недостаточно прав." });

    req.employee = payload;
    next();
  } catch (error) {
    return res.status(400).send({ message: "Недействительный токен." });
  }
};
