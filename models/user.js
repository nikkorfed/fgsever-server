const { DataTypes } = require("sequelize");
const { withPagination } = require("../utils");

const db = require("../db");

const User = db.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
});

withPagination(User);

module.exports = User;
