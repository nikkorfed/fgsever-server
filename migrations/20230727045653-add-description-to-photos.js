exports.up = async (query, Sequelize) => {
  await query.addColumn("photos", "description", { type: Sequelize.STRING });
};

exports.down = async (query, Sequelize) => {
  await query.removeColumn("photos", "description");
};
