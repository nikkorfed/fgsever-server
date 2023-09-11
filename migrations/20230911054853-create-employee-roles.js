exports.up = async (query, Sequelize) => {
  await query.createTable("employeeRoles", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    employeeGuid: { type: Sequelize.STRING, allowNull: false },
    role: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
  await query.addConstraint("employeeRoles", { type: "UNIQUE", fields: ["employeeGuid"] });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("employeeRoles");
};
