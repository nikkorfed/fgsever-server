exports.up = async (query, Sequelize) => {
  await query.createTable("employees", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    guid: { type: Sequelize.STRING, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
  await query.addConstraint("employees", { type: "UNIQUE", fields: ["guid"] });
};

exports.down = async (query, Sequelize) => {
  await query.dropTable("employees");
};
