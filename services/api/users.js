const utils = require("~/utils");

const { User } = require("~/models");

exports.create = async (body) => {
  return await User.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "name" });
  return await User.paginate(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await User.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const user = await User.findByPk(guid);
  return await user.update(body);
};

exports.deleteById = async (guid) => {
  const user = await User.findByPk(guid);
  return await user.destroy();
};
