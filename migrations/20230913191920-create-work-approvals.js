exports.up = async (query, Sequelize) => {
  await query.createTable("workApprovals", {
    guid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("workApprovals");
};
