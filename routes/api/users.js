const express = require("express");
const router = express.Router();

const { users } = require("~/controllers/api");

router.post("/", users.create);
router.get("/", users.getAll);
router.get("/:guid", users.getById);
router.put("/:guid", users.updateById);
router.delete("/:guid", users.deleteById);

module.exports = router;
