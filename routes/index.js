const express = require("express");
const proxy = require("express-http-proxy");
const router = express.Router();

const aosParser = require("./aos-parser");
const upgradeCalculator = require("./upgrade-calculator");
const parts = require("./parts");
const workPrices = require("./work-prices");
const qrCode = require("./qr-code");
const survey = require("./survey");
const api = require("./api");

router.use("/aos-parser", aosParser);
router.use("/upgrade-calculator", upgradeCalculator);
router.use("/parts", parts);
router.use("/work-prices", workPrices);
router.use("/qr-code", qrCode);
router.use("/survey", survey);
router.use("/api", api);
router.use("/proxy", proxy("https://parts.major-auto.ru:8066"));

module.exports = router;
