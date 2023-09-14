const { DataTypes } = require("sequelize");

const db = require("../db");

const Notification = db.define("notifications", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.STRING, allowNull: false },
  to: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.STRING, allowNull: false },
  data: { type: DataTypes.JSON },
});

module.exports = Notification;
