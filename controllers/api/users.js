const { users } = require("~/services/api");

exports.create = async (req, res, next) => {
  const video = await users.create(req.body);
  return res.json(video);
};

exports.getAll = async (req, res, next) => {
  const videos = await users.getAll(req.query);
  return res.json(videos);
};

exports.getById = async (req, res, next) => {
  const video = await users.getById(req.params.guid, req.query);
  return res.json(video);
};

exports.updateById = async (req, res, next) => {
  const video = await users.updateById(req.params.guid, req.body);
  return res.json(video);
};

exports.deleteById = async (req, res, next) => {
  const video = await users.deleteById(req.params.guid);
  return res.json(video);
};
