const sequelize = require("./index");
const Sequelize = require('sequelize');

const application = sequelize.define("application", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false
  },
  car: {
    type: Sequelize.STRING,
    allowNull: false
  },
  service: {
    type: Sequelize.STRING,
    allowNull: false
  },
  date: {
    type: Sequelize.STRING,
    allowNull: false
  },
  problem: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  img: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: false
  },
});

module.exports = application;