const { DataTypes } = require("sequelize");

const db = require("../db");

const Employee = db.define("employee", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guid: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Employee;
