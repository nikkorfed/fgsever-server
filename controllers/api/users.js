const apiServices = require("~/services/api");

exports.getAll = async (req, res, next) => {
  const videos = await apiServices.users.getAll(req.query);
  return res.json(videos);
};

exports.getById = async (req, res, next) => {
  const video = await apiServices.users.getById(req.params.id, req.query);
  return res.json(video);
};

exports.create = async (req, res, next) => {
  const video = await apiServices.users.create(req.body);
  return res.json(video);
};

exports.updateById = async (req, res, next) => {
  const video = await apiServices.users.updateById(req.params.id, req.body);
  return res.json(video);
};

exports.deleteById = async (req, res, next) => {
  const video = await apiServices.users.deleteById(req.params.id);
  return res.json(video);
};
