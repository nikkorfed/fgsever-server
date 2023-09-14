exports.up = async (query, Sequelize) => {
  await query.createTable("works", {
    guid: { type: Sequelize.UUID, primaryKey: true },
    date: { type: Sequelize.DATE, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("works");
};
