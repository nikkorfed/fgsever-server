const { Sequelize } = require("sequelize");

const config = require("~/config");

const db = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  benchmark: true,
  logging: false,
});

module.exports = db;
