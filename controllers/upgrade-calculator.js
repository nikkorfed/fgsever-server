const { getOptions } = require("../services/upgrade-calculator");

exports.getOptions = async (req, res) => {
  const { modelCode, productionDate, currentOptions } = req.body;
  console.log(`[${modelCode}] Запрос опций дооснащения из таблицы...`);

  const options = await getOptions({ modelCode, productionDate, currentOptions });
  return res.send(options);
};
