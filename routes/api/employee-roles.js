const express = require("express");
const router = express.Router();

const { employeeRoles } = require("~/controllers/api");

router.post("/", employeeRoles.create);
router.get("/", employeeRoles.getAll);
router.get("/:guid", employeeRoles.getById);
router.put("/:guid", employeeRoles.updateById);
router.delete("/:guid", employeeRoles.deleteById);

module.exports = router;
