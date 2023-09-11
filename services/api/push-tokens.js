const utils = require("~/utils");

const { PushToken } = require("~/models");

exports.create = async (body) => {
  return await PushToken.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "token" });
  return await PushToken.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await PushToken.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const pushToken = await PushToken.findByPk(guid);
  return await pushToken.update(body);
};

exports.deleteById = async (guid) => {
  const pushToken = await PushToken.findByPk(guid);
  return await pushToken.destroy();
};
