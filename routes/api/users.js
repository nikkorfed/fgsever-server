const express = require("express");
const router = express.Router();

const { users } = require("~/controllers/api");

router.get("/", users.getAll);
router.get("/:id", users.getById);
router.post("/", users.create);
router.put("/:id", users.updateById);
router.delete("/:id", users.deleteById);

module.exports = router;
