const bcrypt = require("bcrypt");
const { pick } = require("lodash");

const { Employee } = require("~/models");
const utils = require("~/utils");

exports.login = async (body) => {
  const employee = await Employee.findOne({ where: pick(body, ["guid"]) });
  if (!employee) return { message: "Неверный логин или пароль." };

  const validPassword = await bcrypt.compare(body.password, employee.password);
  if (!validPassword) return { message: "Неверный логин или пароль." };

  const token = employee.generateAuthToken();
  return { token };
};

exports.create = async (body) => {
  const existingEmployee = await Employee.findOne({ where: pick(body, ["guid"]) });
  if (existingEmployee) return { message: "Пользователь уже зарегистрирован." };

  const salt = await bcrypt.genSalt();
  body.password = await bcrypt.hash(body.password, salt);

  const employee = await Employee.create(body);
  const token = employee.generateAuthToken();

  return { token, employee: pick(employee, ["id", "guid", "name", "createdAt", "updatedAt"]) };
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "name" });
  options.attributes = { exclude: ["password"] };
  return await Employee.findAll(options);
};

exports.getById = async (id) => {
  return await Employee.findByPk(id, { attributes: { exclude: ["password"] } });
};

exports.updateById = async (id, body) => {
  const employee = await Employee.findByPk(id, { attributes: { exclude: ["password"] } });
  return await employee.update(body);
};

exports.deleteById = async (id) => {
  const employee = await Employee.findByPk(id, { attributes: { exclude: ["password"] } });
  return await employee.destroy();
};
