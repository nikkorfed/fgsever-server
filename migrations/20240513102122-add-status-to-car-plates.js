exports.up = async (query, Sequelize) => {
  await query.addColumn("carPlates", "status", { type: Sequelize.STRING });
};

exports.down = async (query, Sequelize) => {
  await query.removeColumn("carPlates", "status");
};
