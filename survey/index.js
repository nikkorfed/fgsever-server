const fs = require("fs/promises");
const express = require("express");
const router = express.Router();

fs.mkdir(__dirname + "/data", { recursive: true });

router.use(express.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  res.send("Здесь будут приниматься анкеты!");
});

router.post("/", async (req, res) => {
  let data = req.body;
  await fs.writeFile(__dirname + `/data/${Date.now()}.json`, JSON.stringify(data, null, 2));
  res.json({ result: "Анкета успешно сохранена", data });
});

module.exports = router;
