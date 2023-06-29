const express = require("express");
const router = express.Router();

const { employees } = require("~/controllers/api");

router.post("/", employees.create);
router.get("/", employees.getAll);
router.get("/:id", employees.getById);
router.put("/:id", employees.updateById);
router.delete("/:id", employees.deleteById);

module.exports = router;
