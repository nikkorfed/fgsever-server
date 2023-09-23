const utils = require("~/utils");

const { Request } = require("../../models");

exports.create = async (body) => {
  return await Request.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "guid" });
  return await Request.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await Request.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const request = await Request.findByPk(guid);
  return await request.update(body);
};

exports.deleteById = async (guid) => {
  const request = await Request.findByPk(guid);
  return await request.destroy();
};
