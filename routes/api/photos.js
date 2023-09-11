const express = require("express");
const router = express.Router();

const { photos } = require("~/controllers/api");

router.post("/", photos.create);
router.get("/", photos.getAll);
router.get("/:guid", photos.getById);
router.put("/:guid", photos.updateById);
router.delete("/:guid", photos.deleteById);

module.exports = router;
