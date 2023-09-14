const { Op } = require("sequelize");

exports.up = async (query, Sequelize) => {
  await query.addColumn("pushTokens", "type", { type: Sequelize.STRING });
  await query.bulkUpdate("pushTokens", { type: "car" });
  await query.changeColumn("pushTokens", "type", { type: Sequelize.STRING, allowNull: false });
  await query.renameColumn("pushTokens", "carGuid", "refGuid");
};

exports.down = async (query, Sequelize) => {
  await query.renameColumn("pushTokens", "refGuid", "carGuid");
  await query.bulkDelete("pushTokens", { type: { [Op.ne]: "car" } });
  await query.removeColumn("pushTokens", "type");
};
