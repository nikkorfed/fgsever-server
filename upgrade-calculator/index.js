const express = require("express");
const router = express.Router();

const getOptions = require("./getOptions");

router.use(express.json());

router.post("/", async (req, res) => {
  let { modelCode, productionDate, currentOptions } = req.body;
  console.log(`[${modelCode}] Запрос данных из таблицы...`);
  res.send(await getOptions({ modelCode, productionDate, currentOptions }));
});

module.exports = router;
