exports.up = async (query, Sequelize) => {
  await query.createTable("requests", {
    guid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    workGuid: { type: Sequelize.UUID, allowNull: false },
    status: { type: Sequelize.STRING, allowNull: false },
    type: { type: Sequelize.STRING, allowNull: false },
    data: { type: Sequelize.JSON },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("requests");
};
