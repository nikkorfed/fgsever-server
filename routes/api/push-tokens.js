const express = require("express");
const router = express.Router();

const { pushTokens } = require("~/controllers/api");

router.post("/", pushTokens.create);
router.get("/", pushTokens.getAll);
router.get("/:guid", pushTokens.getById);
router.put("/:guid", pushTokens.updateById);
router.delete("/:guid", pushTokens.deleteById);

module.exports = router;
