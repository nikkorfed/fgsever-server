const utils = require("~/utils");

const { WorkApproval } = require("~/models");

exports.create = async (body) => {
  return await WorkApproval.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "guid" });
  return await WorkApproval.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await WorkApproval.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const workApproval = await WorkApproval.findByPk(guid);
  return await workApproval.update(body);
};

exports.deleteById = async (guid) => {
  const workApproval = await WorkApproval.findByPk(guid);
  return await workApproval.destroy();
};
