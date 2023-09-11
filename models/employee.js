const { DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

const Employee = db.define("employee", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

Employee.prototype.generateAuthToken = function () {
  const payload = { guid: this.guid, name: this.name, type: "employee" };
  return jwt.sign(payload, JWT_SECRET);
};

module.exports = Employee;
