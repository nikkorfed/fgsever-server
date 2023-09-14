exports.up = async (query, Sequelize) => {
  await query.createTable("notifications", {
    guid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    type: { type: Sequelize.STRING, allowNull: false },
    to: { type: Sequelize.STRING, allowNull: false },
    title: { type: Sequelize.STRING, allowNull: false },
    body: { type: Sequelize.STRING, allowNull: false },
    data: { type: Sequelize.JSON },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("notifications");
};
