const utils = require("~/utils");

const { EmployeeRole } = require("~/models");

exports.create = async (body) => {
  return await EmployeeRole.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "role" });
  return await EmployeeRole.findAll(options);
};

exports.getById = async (id, query) => {
  const options = utils.query.parse(query);
  return await EmployeeRole.findByPk(id, options);
};

exports.updateById = async (id, body) => {
  const pushToken = await EmployeeRole.findByPk(id);
  return await pushToken.update(body);
};

exports.deleteById = async (id) => {
  const pushToken = await EmployeeRole.findByPk(id);
  return await pushToken.destroy();
};
