const { DataTypes } = require("sequelize");

const db = require("../db");

const EmployeeRole = db.define("employeeRole", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeGuid: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, allowNull: false },
});

module.exports = EmployeeRole;
