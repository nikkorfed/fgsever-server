const fs = require("fs/promises");
const express = require("express");
const router = express.Router();

const { parts } = require("~/controllers");

// Подбор запчастей
router.get("/original/:numbers", parts.searchOriginals);
router.get("/alternative/:number", parts.searchAlternatives);

// Создание папок
fs.mkdir("services/parts/cookies", { recursive: true });

module.exports = router;
