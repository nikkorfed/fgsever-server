const express = require("express");
const router = express.Router();

const { works } = require("~/controllers/api");

router.post("/", works.create);
router.get("/", works.getAll);
router.get("/:guid", works.getById);
router.put("/:guid", works.updateById);
router.delete("/:guid", works.deleteById);

module.exports = router;
