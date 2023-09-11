const { DataTypes } = require("sequelize");
const { withPagination } = require("../utils");

const db = require("../db");

const User = db.define("user", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
});

withPagination(User);

module.exports = User;
