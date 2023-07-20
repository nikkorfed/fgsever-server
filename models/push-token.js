const { DataTypes } = require("sequelize");

const db = require("../db");

const PushToken = db.define("pushToken", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  token: { type: DataTypes.STRING, allowNull: false },
  carGuid: { type: DataTypes.STRING, allowNull: false },
});

module.exports = PushToken;
