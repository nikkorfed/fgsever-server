const { DataTypes } = require("sequelize");

const db = require("../db");

const WorkApproval = db.define("workApproval", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
});

module.exports = WorkApproval;
