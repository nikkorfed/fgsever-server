const fs = require("fs/promises");
const express = require("express");
const router = express.Router();

const { qrCode } = require("~/controllers");

// Парсинг тела запроса
router.use(express.json());

// Отправка QR-кода
router.get("/", qrCode.get);

// Установка QR-кода
router.put("/", qrCode.put);

// Создание папок
fs.mkdir("services/qr-code/data", { recursive: true });

module.exports = router;
