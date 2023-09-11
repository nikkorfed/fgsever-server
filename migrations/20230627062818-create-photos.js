exports.up = async (query, Sequelize) => {
  await query.createTable("photos", {
    guid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    url: { type: Sequelize.STRING, allowNull: false },
    workGuid: { type: Sequelize.UUID, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("photos");
};
