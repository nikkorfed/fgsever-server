const utils = require("~/utils");

const { EmployeeRole } = require("~/models");

exports.create = async (body) => {
  return await EmployeeRole.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "role" });
  return await EmployeeRole.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await EmployeeRole.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const pushToken = await EmployeeRole.findByPk(guid);
  return await pushToken.update(body);
};

exports.deleteById = async (guid) => {
  const pushToken = await EmployeeRole.findByPk(guid);
  return await pushToken.destroy();
};
