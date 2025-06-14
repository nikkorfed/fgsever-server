const { DataTypes } = require("sequelize");

const db = require("../db");

const PushToken = db.define("pushToken", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  refGuid: { type: DataTypes.UUID, allowNull: false },
});

module.exports = PushToken;
