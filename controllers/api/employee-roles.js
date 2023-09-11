const { employeeRoles } = require("~/services/api");

exports.create = async (req, res, next) => {
  const result = await employeeRoles.create(req.body);
  return res.json(result);
};

exports.getAll = async (req, res, next) => {
  const result = await employeeRoles.getAll(req.query);
  return res.json(result);
};

exports.getById = async (req, res, next) => {
  const result = await employeeRoles.getById(req.params.guid, req.query);
  return res.json(result);
};

exports.updateById = async (req, res, next) => {
  const result = await employeeRoles.updateById(req.params.guid, req.body);
  return res.json(result);
};

exports.deleteById = async (req, res, next) => {
  const result = await employeeRoles.deleteById(req.params.guid);
  return res.json(result);
};
