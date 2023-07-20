const express = require("express");
const router = express.Router();

const { auth } = require("~/middleware");
const { employees } = require("~/controllers/api");

router.post("/login", employees.login);
router.post("/", employees.create);
router.get("/", employees.getAll);
router.get("/me", auth.employee, employees.getMe);
router.get("/:id", employees.getById);
router.put("/:id", auth.employee, employees.updateById);
router.delete("/:id", auth.employee, employees.deleteById);

module.exports = router;
