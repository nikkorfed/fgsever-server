const express = require("express");
const router = express.Router();

const { auth } = require("~/middleware");
const { employees } = require("~/controllers/api");

router.post("/login", employees.login);
router.post("/", employees.create);
router.get("/", employees.getAll);
router.get("/me", auth.employee, employees.getMe);
router.get("/:guid", employees.getById);
router.put("/:guid", auth.employee, employees.updateById);
router.delete("/:guid", auth.employee, employees.deleteById);

module.exports = router;
