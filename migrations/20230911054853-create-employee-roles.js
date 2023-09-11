exports.up = async (query, Sequelize) => {
  await query.createTable("employeeRoles", {
    guid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    role: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("employeeRoles");
};
