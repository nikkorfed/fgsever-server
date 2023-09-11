const { DataTypes } = require("sequelize");

const db = require("../db");

const EmployeeRole = db.define("employeeRole", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  role: { type: DataTypes.STRING, allowNull: false },
});

module.exports = EmployeeRole;
