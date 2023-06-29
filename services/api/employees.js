const bcrypt = require("bcrypt");
const { pick, omit } = require("lodash");

const { Employee } = require("~/models");
const utils = require("~/utils");

exports.create = async (body) => {
  const [existingUser] = await Employee.findAll({ where: pick(body, ["guid", "name"]) });
  if (existingUser) return { message: "Пользователь уже зарегистрирован." };

  const salt = await bcrypt.genSalt();
  body.password = await bcrypt.hash(body.password, salt);

  const user = await Employee.create(body);
  return pick(user, ["id", "guid", "name", "createdAt", "updatedAt"]);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "name" });
  options.attributes = { exclude: ["password"] };
  return await Employee.findAll(options);
};

exports.getById = async (id, query) => {
  const options = utils.query.parse(query);
  options.attributes = { exclude: ["password"] };
  return await Employee.findByPk(id, options);
};

exports.updateById = async (id, body) => {
  const user = await Employee.findByPk(id, { attributes: { exclude: ["password"] } });
  return await user.update(body);
};

exports.deleteById = async (id) => {
  const user = await Employee.findByPk(id, { attributes: { exclude: ["password"] } });
  return await user.destroy();
};
