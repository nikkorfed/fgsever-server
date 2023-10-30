const { Op } = require("sequelize");

exports.up = async (query, Sequelize) => {
  await query.addColumn("requests", "refType", { type: Sequelize.STRING });
  await query.bulkUpdate("requests", { refType: "work" });
  await query.changeColumn("requests", "refType", { type: Sequelize.STRING, allowNull: false });
  await query.renameColumn("requests", "workGuid", "refGuid");
};

exports.down = async (query, Sequelize) => {
  await query.renameColumn("requests", "refGuid", "workGuid");
  await query.bulkDelete("requests", { refType: { [Op.ne]: "work" } });
  await query.removeColumn("requests", "refType");
};
