exports.up = async (query, Sequelize) => {
  await query.createTable("carPlates", {
    guid: { type: Sequelize.UUID, primaryKey: true },
    value: { type: Sequelize.STRING, allowNull: false },
    organization: { type: Sequelize.STRING, allowNull: false },
    source: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("carPlates");
};
