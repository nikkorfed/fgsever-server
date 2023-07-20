const { notifications } = require("~/services/api");

exports.send = async (req, res, next) => {
  const result = await notifications.send(req.body);
  return res.json(result);
};
