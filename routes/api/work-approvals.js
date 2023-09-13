const express = require("express");
const router = express.Router();

const { workApprovals } = require("~/controllers/api");

router.post("/", workApprovals.create);
router.get("/", workApprovals.getAll);
router.get("/:guid", workApprovals.getById);
router.put("/:guid", workApprovals.updateById);
router.delete("/:guid", workApprovals.deleteById);

module.exports = router;
