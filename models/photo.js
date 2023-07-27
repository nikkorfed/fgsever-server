const { DataTypes } = require("sequelize");

const db = require("../db");

const Photo = db.define("photo", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  url: { type: DataTypes.STRING, allowNull: false },
  workGuid: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
});

module.exports = Photo;
