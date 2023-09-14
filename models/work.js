const { DataTypes } = require("sequelize");

const db = require("../db");

const Work = db.define("work", {
  guid: { type: DataTypes.UUID, primaryKey: true },
  date: { type: DataTypes.DATE, allowNull: false },
});

module.exports = Work;
