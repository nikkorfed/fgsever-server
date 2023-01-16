const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const admins = [
  1287582209, // Павел Дерюгин
  426923021, // Никита Корнилов
];

exports.notify = async (text) => {
  for (const admin of admins) await bot.telegram.sendMessage(admin, text, { parse_mode: "Markdown" });
};
