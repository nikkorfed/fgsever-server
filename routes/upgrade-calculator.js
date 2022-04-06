const express = require("express");
const router = express.Router();

const { upgradeCalculator } = require("~/controllers");

router.use(express.json());

router.post("/", upgradeCalculator.getOptions);

module.exports = router;
