const express = require("express");
const router = express.Router();

const { photos } = require("~/controllers/api");

router.post("/", photos.create);
router.get("/", photos.getAll);
router.get("/:id", photos.getById);
router.put("/:id", photos.updateById);
router.delete("/:id", photos.deleteById);

module.exports = router;
