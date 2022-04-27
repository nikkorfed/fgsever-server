const express = require("express");
const router = express.Router();

const { workPrices } = require("~/controllers");

// Цены на работы
router.get("/", workPrices.getPrices);

// Цены на работы для определенной серии
router.get("/:series", workPrices.getPricesForSeries);

module.exports = router;
