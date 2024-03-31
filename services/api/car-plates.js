const { uniq, uniqBy } = require("lodash");

const { CarPlate } = require("../../models");
const { odata } = require("~/api");
const utils = require("~/utils");

exports.syncWith1C = async () => {
  try {
    const newWorks = await odata.works(true);
    if (!newWorks.length) return;

    const carGuids = uniq(newWorks.map((work) => work.carGuid));
    const carPlates = uniqBy(await odata.carPlates(carGuids), "guid");

    const deleted = await CarPlate.destroy({ where: { organization: "fgsever", source: "1c" } });
    await CarPlate.bulkCreate(carPlates.map((plate) => ({ ...plate, organization: "fgsever", source: "1c" })));
    console.log(`Были обновлены предварительные заказ-наряды (${carPlates.length} добавлено, ${deleted} удалено)!`);
  } catch (error) {
    console.log("Поиск предварительных заказ-нарядов не удался.", error);
  }
};

exports.syncWith1C();
setInterval(exports.syncWith1C, 60 * 60 * 1000);

exports.create = async (body) => {
  return await CarPlate.create(body);
};

exports.getAll = async (query) => {
  query.limit = 1000;
  const options = utils.query.parse(query, { searchField: "guid" });
  return await CarPlate.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await CarPlate.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const work = await CarPlate.findByPk(guid);
  return await work.update(body);
};

exports.deleteById = async (guid) => {
  const work = await CarPlate.findByPk(guid);
  return await work.destroy();
};
