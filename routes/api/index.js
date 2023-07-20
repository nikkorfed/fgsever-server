const express = require("express");
const router = express.Router();

const users = require("./users");
const photos = require("./photos");
const employees = require("./employees");
const pushTokens = require("./push-tokens");
const files = require("./files");

router.use("/users", users);
router.use("/photos", photos);
router.use("/employees", employees);
router.use("/push-tokens", pushTokens);
router.use("/files", files);

module.exports = router;
