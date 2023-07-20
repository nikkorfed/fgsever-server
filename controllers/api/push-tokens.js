const { pushTokens } = require("~/services/api");

exports.create = async (req, res, next) => {
  const result = await pushTokens.create(req.body);
  return res.json(result);
};

exports.getAll = async (req, res, next) => {
  const result = await pushTokens.getAll(req.query);
  return res.json(result);
};

exports.getById = async (req, res, next) => {
  const result = await pushTokens.getById(req.params.id, req.query);
  return res.json(result);
};

exports.updateById = async (req, res, next) => {
  const result = await pushTokens.updateById(req.params.id, req.body);
  return res.json(result);
};

exports.deleteById = async (req, res, next) => {
  const result = await pushTokens.deleteById(req.params.id);
  return res.json(result);
};
