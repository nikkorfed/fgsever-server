const { Op } = require("sequelize");
const { Expo } = require("expo-server-sdk");

const { EmployeeRole, PushToken, Notification } = require("../../models");

const expo = new Expo();

exports.send = async ({ type, to, title, body, data }) => {
  const validToken = Array.isArray(to) ? to.every((token) => Expo.isExpoPushToken(token)) : Expo.isExpoPushToken(to);
  if (!validToken) return { message: "Передан недействительный push-токен." };

  const message = { to, sound: "default", title, body, data };
  const tickets = await expo.sendPushNotificationsAsync([message]);

  await Notification.bulkCreate(Array.isArray(to) ? to.map((to) => ({ type, to, title, body, data })) : [message]);
  return tickets;
};

exports.sendToMasters = async ({ type, title, body, data }) => {
  const employeeMasters = await EmployeeRole.findAll({ where: { [Op.or]: [{ role: "workshop-foreman" }, { role: "service-advisor" }] } });
  if (!employeeMasters.length) return;

  const employeeMasterGuids = employeeMasters.map((employee) => employee.guid);
  const employeeMasterPushTokens = await PushToken.findAll({ where: { type: "employee", refGuid: { [Op.or]: employeeMasterGuids } } });
  const employeeMasterTokens = employeeMasterPushTokens.map((item) => item.token);
  if (!employeeMasterTokens.length) return;

  return await exports.send({ type, to: employeeMasterTokens, title, body, data });
};

exports.sendToDirectors = async ({ type, title, body, data }) => {
  const directors = await EmployeeRole.findAll({ where: { role: "director" } });
  if (!directors.length) return;

  const directorGuids = directors.map((employee) => employee.guid);
  const directorPushTokens = await PushToken.findAll({ where: { type: "employee", refGuid: { [Op.or]: directorGuids } } });
  const directorTokens = directorPushTokens.map((item) => item.token);
  if (!directorTokens.length) return;

  return await exports.send({ type, to: directorTokens, title, body, data });
};
