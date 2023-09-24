const utils = require("~/utils");

const { WorkApproval } = require("../../models");
const { notifications } = require("../../services/api");
const { odata } = require("../../api");

exports.create = async (body) => {
  const workApproval = await WorkApproval.create(body);
  const work = await odata.getWork(workApproval.guid);
  const [car] = await odata.cars([work.carGuid]);

  await notifications.sendToMasters({
    type: "addWorkApproval",
    title: "Работы согласованы",
    body: `По заказ-наряду № ${work.number} для ${car.name} заказчиком были согласованы указанные работы.`,
  });

  return workApproval;
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "guid" });
  return await WorkApproval.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await WorkApproval.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const workApproval = await WorkApproval.findByPk(guid);
  return await workApproval.update(body);
};

exports.deleteById = async (guid) => {
  const workApproval = await WorkApproval.findByPk(guid);
  return await workApproval.destroy();
};
