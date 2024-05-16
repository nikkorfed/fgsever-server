const { Op } = require("sequelize");

exports.up = async (query, Sequelize) => {
  await query.renameColumn("carPlates", "status", "comment");
};

exports.down = async (query, Sequelize) => {
  await query.renameColumn("carPlates", "comment", "status");
};
