const { DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

const Employee = db.define("employee", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guid: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

Employee.prototype.generateAuthToken = function () {
  const payload = { id: this.id, guid: this.guid, name: this.name, role: "employee" };
  return jwt.sign(payload, JWT_SECRET);
};

module.exports = Employee;
