const express = require("express");
const router = express.Router();

const { notifications } = require("~/controllers/api");

router.post("/", notifications.send);

module.exports = router;
