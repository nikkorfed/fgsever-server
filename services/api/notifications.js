const { Expo } = require("expo-server-sdk");

const { Notification } = require("~/models");

const expo = new Expo();

exports.send = async ({ type, to, title, body, data }) => {
  const validToken = Array.isArray(to) ? to.every((token) => Expo.isExpoPushToken(token)) : Expo.isExpoPushToken(to);
  if (!validToken) return { message: "Передан недействительный push-токен." };

  const message = { to, title, body, data };
  const tickets = await expo.sendPushNotificationsAsync([message]);

  await Notification.bulkCreate(Array.isArray(to) ? to.map((to) => ({ type, to, title, body, data })) : [message]);
  return tickets;
};
