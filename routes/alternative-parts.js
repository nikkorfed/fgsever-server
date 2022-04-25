const fs = require("fs/promises");
const express = require("express");
const router = express.Router();

const { alternativeParts } = require("~/controllers");

// Подбор аналогов
router.get("/:number", alternativeParts.search);

// Создание папок
fs.mkdir("services/alternative-parts/cookies", { recursive: true });

module.exports = router;
