const { DataTypes } = require("sequelize");

const db = require("../db");

const CarPlate = db.define("carPlate", {
  guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  value: { type: DataTypes.STRING, allowNull: false },
  organization: { type: DataTypes.STRING, allowNull: false },
  source: { type: DataTypes.STRING, allowNull: false },
  comment: { type: DataTypes.STRING },
});

module.exports = CarPlate;
