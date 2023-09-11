const utils = require("~/utils");

const { Photo } = require("~/models");

exports.create = async (body) => {
  return await Photo.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "name" });
  return await Photo.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await Photo.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const user = await Photo.findByPk(guid);
  return await user.update(body);
};

exports.deleteById = async (guid) => {
  const user = await Photo.findByPk(guid);
  return await user.destroy();
};
