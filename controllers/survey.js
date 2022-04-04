const { saveAnswer } = require("../services/survey");

exports.index = async (req, res) => {
  return res.send("Здесь будут приниматься анкеты!");
};

exports.saveAnswer = async (req, res) => {
  const data = req.body;
  await saveAnswer(data);
  return res.json({ result: "Анкета успешно сохранена", data });
};
