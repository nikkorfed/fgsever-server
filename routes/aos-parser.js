const fs = require("fs/promises");
const express = require("express");
const router = express.Router();

const { aosParser } = require("../controllers");

// Папка с изображениями
router.use("/images", express.static("services/aos-parser/images"));

// Информация об автомобиле
router.get("/", aosParser.getCarInfo);

// Изображения автомобиля
router.get("/images", aosParser.getCarImages);

// Создание папок
fs.mkdir("services/aos-parser/cache", { recursive: true });
fs.mkdir("services/aos-parser/cookies", { recursive: true });

module.exports = router;
