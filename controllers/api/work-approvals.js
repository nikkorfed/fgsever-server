const { workApprovals } = require("~/services/api");

exports.create = async (req, res, next) => {
  const result = await workApprovals.create(req.body);
  return res.json(result);
};

exports.getAll = async (req, res, next) => {
  const result = await workApprovals.getAll(req.query);
  return res.json(result);
};

exports.getById = async (req, res, next) => {
  const result = await workApprovals.getById(req.params.guid, req.query);
  return res.json(result);
};

exports.updateById = async (req, res, next) => {
  const result = await workApprovals.updateById(req.params.guid, req.body);
  return res.json(result);
};

exports.deleteById = async (req, res, next) => {
  const result = await workApprovals.deleteById(req.params.guid);
  return res.json(result);
};
