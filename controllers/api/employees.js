const { employees } = require("~/services/api");

exports.login = async (req, res, next) => {
  const result = await employees.login(req.body);
  return res.json(result);
};

exports.create = async (req, res, next) => {
  const result = await employees.create(req.body);
  return res.json(result);
};

exports.getAll = async (req, res, next) => {
  const result = await employees.getAll(req.query);
  return res.json(result);
};

exports.getMe = async (req, res, next) => {
  const result = await employees.getById(req.employee.guid);
  return res.json(result);
};

exports.getById = async (req, res, next) => {
  const result = await employees.getById(req.params.guid);
  return res.json(result);
};

exports.updateById = async (req, res, next) => {
  const result = await employees.updateById(req.params.guid, req.body);
  return res.json(result);
};

exports.deleteById = async (req, res, next) => {
  const result = await employees.deleteById(req.params.guid);
  return res.json(result);
};
