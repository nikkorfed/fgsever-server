const utils = require("~/utils");

const { User } = require("~/models");

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "name" });
  return await User.paginate(options);
};

exports.getById = async (id, query) => {
  const options = utils.query.parse(query);
  return await User.findByPk(id, options);
};

exports.create = async (body) => {
  return await User.create(body);
};

exports.updateById = async (id, body) => {
  const user = await User.findByPk(id);
  return await user.update(body);
};

exports.deleteById = async (id) => {
  const user = await User.findByPk(id);
  return await user.destroy();
};
