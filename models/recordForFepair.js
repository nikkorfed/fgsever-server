const sequelize = require("./index");
const Sequelize = require('sequelize');

const recordForFepair = sequelize.define("recordForFepair", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  avto: {
    type: Sequelize.STRING,
    allowNull: false
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false
  }, userId: {
    type: Sequelize.STRING,
    allowNull: false
  }, img: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

module.exports = recordForFepair;