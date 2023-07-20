exports.up = async (query, Sequelize) => {
  await query.createTable("pushTokens", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type: Sequelize.STRING, allowNull: false },
    carGuid: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("pushTokens");
};
