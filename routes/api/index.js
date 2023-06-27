const express = require("express");
const router = express.Router();

const users = require("./users");
const photos = require("./photos");
const files = require("./files");

router.use("/users", users);
router.use("/photos", photos);
router.use("/files", files);

module.exports = router;
