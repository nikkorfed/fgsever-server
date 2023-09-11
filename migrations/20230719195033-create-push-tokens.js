exports.up = async (query, Sequelize) => {
  await query.createTable("pushTokens", {
    guid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    token: { type: Sequelize.STRING, allowNull: false },
    carGuid: { type: Sequelize.UUID, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("pushTokens");
};
