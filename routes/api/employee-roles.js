const express = require("express");
const router = express.Router();

const { employeeRoles } = require("~/controllers/api");

router.post("/", employeeRoles.create);
router.get("/", employeeRoles.getAll);
router.get("/:id", employeeRoles.getById);
router.put("/:id", employeeRoles.updateById);
router.delete("/:id", employeeRoles.deleteById);

module.exports = router;
