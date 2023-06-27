exports.up = async (query, Sequelize) => {
  await query.createTable("photos", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: Sequelize.STRING, allowNull: false },
    workGuid: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("photos");
};
