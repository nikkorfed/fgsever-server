const express = require("express");
const router = express.Router();

const users = require("./users");
const files = require("./files");

router.use("/users", users);
router.use("/files", files);

module.exports = router;
