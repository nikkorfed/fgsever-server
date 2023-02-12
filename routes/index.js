const express = require("express");
const router = express.Router();

const aosParser = require("./aos-parser");
const upgradeCalculator = require("./upgrade-calculator");
const parts = require("./parts");
const workPrices = require("./work-prices");
const survey = require("./survey");
const api = require("./api");
const {addApplication} = require("../controllers/api/application")

router.use("/aos-parser", aosParser);
router.use("/upgrade-calculator", upgradeCalculator);
router.use("/parts", parts);
router.use("/work-prices", workPrices);
router.use("/survey", survey);
router.use("/api", api);
router.post("/defectfile", addApplication);

module.exports = router;
