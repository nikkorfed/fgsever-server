const { photos } = require("~/services/api");

exports.create = async (req, res, next) => {
  const result = await photos.create(req.body);
  return res.json(result);
};

exports.getAll = async (req, res, next) => {
  const result = await photos.getAll(req.query);
  return res.json(result);
};

exports.getById = async (req, res, next) => {
  const result = await photos.getById(req.params.guid, req.query);
  return res.json(result);
};

exports.updateById = async (req, res, next) => {
  const result = await photos.updateById(req.params.guid, req.body);
  return res.json(result);
};

exports.deleteById = async (req, res, next) => {
  const result = await photos.deleteById(req.params.guid);
  return res.json(result);
};
