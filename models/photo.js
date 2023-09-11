const { DataTypes } = require("sequelize");

const db = require("../db");

const Photo = db.define("photo", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  url: { type: DataTypes.STRING, allowNull: false },
  workGuid: { type: DataTypes.UUID, allowNull: false },
  description: { type: DataTypes.STRING },
});

module.exports = Photo;
