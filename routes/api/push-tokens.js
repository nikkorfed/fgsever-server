const express = require("express");
const router = express.Router();

const { pushTokens } = require("~/controllers/api");

router.post("/", pushTokens.create);
router.get("/", pushTokens.getAll);
router.get("/:id", pushTokens.getById);
router.put("/:id", pushTokens.updateById);
router.delete("/:id", pushTokens.deleteById);

module.exports = router;
