const { Expo } = require("expo-server-sdk");

const expo = new Expo();

exports.send = async ({ to, title, body, data }) => {
  const validToken = Array.isArray(to) ? to.every((token) => Expo.isExpoPushToken(token)) : Expo.isExpoPushToken(to);
  if (!validToken) return { message: "Передан недействительный push-токен." };

  const message = { to, title, body, data };
  const tickets = await expo.sendPushNotificationsAsync([message]);

  return tickets;
};
