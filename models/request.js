const { DataTypes } = require("sequelize");

const db = require("../db");

const Request = db.define("request", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  refType: { type: DataTypes.STRING, allowNull: false },
  refGuid: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  data: { type: DataTypes.JSON },
});

module.exports = Request;
