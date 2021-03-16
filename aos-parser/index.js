const fs = require("fs/promises");
const express = require("express");
const router = express.Router();

const getCarInfo = require("./car-info");
const getCarImages = require("./car-images");

// Подключение папки с изображениями
router.use("/images", express.static("images"));

// Основные запросы
router.get("/", async (req, res) => {
  // if (req.query.vin && req.query.data == "images") res.send(await getCarImages(req.query.vin, req.hostname));
  if (req.query.vin) res.send(await getCarInfo(req.query.vin));
  else res.send({ error: "no-vin" });
});

// Создание папки для хранения cookies
fs.mkdir(__dirname + "/cookies", { recursive: true });

module.exports = router;
