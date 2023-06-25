const express = require("express");
const router = express.Router();

const { files } = require("~/controllers/api");

router.post("/upload", files.upload);

module.exports = router;
