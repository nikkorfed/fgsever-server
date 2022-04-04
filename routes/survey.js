const fs = require("fs/promises");
const express = require("express");
const router = express.Router();

const { survey } = require("../controllers");

// Парсинг тела запроса
router.use(express.urlencoded({ extended: false }));

// Тестовый ответ
router.get("/", survey.index);

// Приём анкет
router.post("/", survey.saveAnswer);

// Создание папок
fs.mkdir("services/survey/data", { recursive: true });

module.exports = router;
