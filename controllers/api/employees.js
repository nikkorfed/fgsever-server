const { employees } = require("~/services/api");

exports.create = async (req, res, next) => {
  const result = await employees.create(req.body);
  return res.json(result);
};

exports.getAll = async (req, res, next) => {
  const result = await employees.getAll(req.query);
  return res.json(result);
};

exports.getById = async (req, res, next) => {
  const result = await employees.getById(req.params.id, req.query);
  return res.json(result);
};

exports.updateById = async (req, res, next) => {
  const result = await employees.updateById(req.params.id, req.body);
  return res.json(result);
};

exports.deleteById = async (req, res, next) => {
  const result = await employees.deleteById(req.params.id);
  return res.json(result);
};
