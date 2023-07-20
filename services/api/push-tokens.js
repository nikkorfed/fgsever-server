const utils = require("~/utils");

const { PushToken } = require("~/models");

exports.create = async (body) => {
  return await PushToken.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "token" });
  return await PushToken.findAll(options);
};

exports.getById = async (id, query) => {
  const options = utils.query.parse(query);
  return await PushToken.findByPk(id, options);
};

exports.updateById = async (id, body) => {
  const pushToken = await PushToken.findByPk(id);
  return await pushToken.update(body);
};

exports.deleteById = async (id) => {
  const pushToken = await PushToken.findByPk(id);
  return await pushToken.destroy();
};
