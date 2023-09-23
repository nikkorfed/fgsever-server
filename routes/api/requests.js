const express = require("express");
const router = express.Router();

const { requests } = require("~/controllers/api");

router.post("/", requests.create);
router.get("/", requests.getAll);
router.get("/:guid", requests.getById);
router.put("/:guid", requests.updateById);
router.delete("/:guid", requests.deleteById);

module.exports = router;
