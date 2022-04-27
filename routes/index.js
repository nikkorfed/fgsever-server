const express = require("express");
const router = express.Router();

const aosParser = require("./aos-parser");
const upgradeCalculator = require("./upgrade-calculator");
const alternativeParts = require("./alternative-parts");
const workPrices = require("./work-prices");
const survey = require("./survey");

router.use("/aos-parser", aosParser);
router.use("/upgrade-calculator", upgradeCalculator);
router.use("/alternative-parts", alternativeParts);
router.use("/work-prices", workPrices);
router.use("/survey", survey);

module.exports = router;
