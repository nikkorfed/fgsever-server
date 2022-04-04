const express = require("express");
const router = express.Router();

const aosParser = require("./aos-parser");
const upgradeCalculator = require("./upgrade-calculator");
const survey = require("./survey");

router.use("/aos-parser", aosParser);
router.use("/upgrade-calculator", upgradeCalculator);
router.use("/survey", survey);

module.exports = router;
