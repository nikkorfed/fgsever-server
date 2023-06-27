const utils = require("~/utils");

const { Photo } = require("~/models");

exports.create = async (body) => {
  return await Photo.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "name" });
  return await Photo.findAll(options);
};

exports.getById = async (id, query) => {
  const options = utils.query.parse(query);
  return await Photo.findByPk(id, options);
};

exports.updateById = async (id, body) => {
  const user = await Photo.findByPk(id);
  return await user.update(body);
};

exports.deleteById = async (id) => {
  const user = await Photo.findByPk(id);
  return await user.destroy();
};
