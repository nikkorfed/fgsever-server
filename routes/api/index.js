const express = require("express");
const router = express.Router();

const files = require("./files");
const users = require("./users");
const photos = require("./photos");
const employees = require("./employees");
const pushTokens = require("./push-tokens");
const notifications = require("./notifications");
const employeeRoles = require("./employee-roles");
const works = require("./works");
const workApprovals = require("./work-approvals");

router.use("/files", files);
router.use("/users", users);
router.use("/photos", photos);
router.use("/employees", employees);
router.use("/push-tokens", pushTokens);
router.use("/notifications", notifications);
router.use("/employee-roles", employeeRoles);
router.use("/works", works);
router.use("/work-approvals", workApprovals);

module.exports = router;
