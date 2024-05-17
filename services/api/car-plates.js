const { uniq, uniqBy } = require("lodash");
const { Sequelize, Op } = require("sequelize");

const { CarPlate } = require("../../models");
const { odata } = require("../../api");
const { differenceBy } = require("../../helpers/difference");
const utils = require("../../utils");

const CAR_PLATE_REGEXP = /[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}/iu;
const WORK_NUMBER_REGEXP = /(?:заявка|заявке|ЗН) (\d+)|(\d+) (?:заявка|заявке|ЗН)/iu;
const SYNC_1C_INTERVAL = 1000 * 60 * 2; // 2 минуты

exports.syncWith1cWorks = async () => {
  try {
    const organization = "fgsever";
    const source = "1cWork";

    const latestWorks = await odata.works(true);
    if (!latestWorks.length) return;

    const carGuids = uniq(latestWorks.map((work) => work.carGuid));
    const carPlates = uniqBy(await odata.carPlates(carGuids), "guid");

    const carPlatesToSync = carPlates.map((plate) => {
      const carWork = latestWorks.find((work) => work.carGuid === plate.guid);
      const comment = `№${carWork.number.trim()}, ${carWork.status}`;
      return { ...plate, organization, source, comment };
    });
    const existingCarPlates = await CarPlate.findAll({ where: { organization, source } });

    const [carPlatesToUpdate, carPlatesToCreate, carPLatesToDelete] = differenceBy(carPlatesToSync, existingCarPlates, "value");

    const updateOnDuplicate = ["value", "organization", "source", "comment", "createdAt", "updatedAt"];
    const updated = await CarPlate.bulkCreate(carPlatesToUpdate, { updateOnDuplicate });
    const created = await CarPlate.bulkCreate(carPlatesToCreate);
    const deleted = await CarPlate.destroy({ where: { guid: carPLatesToDelete.map((plate) => plate.guid) } });

    console.log(`Обновлены госномера из заказ-нарядов 1С (${updated.length} обновлено, ${created.length} добавлено, ${deleted} удалено)!`);
  } catch (error) {
    console.log("Поиск госномеров в заказ-нарядах 1С не удался.", error);
  }
};

exports.syncWith1cCalendar = async () => {
  try {
    const organization = "fgsever";
    const source = "1cCalendar";

    const latestCalendar = await odata.calendar();
    if (!latestCalendar.length) return;

    const carPlateMatches = latestCalendar.map((entry) => {
      const plateMatch = entry.name.match(CAR_PLATE_REGEXP) || entry.description.match(CAR_PLATE_REGEXP);
      const value = plateMatch?.[0]?.toUpperCase();

      const commentMatch = entry.name.match(WORK_NUMBER_REGEXP) || entry.description.match(WORK_NUMBER_REGEXP);
      const comment = commentMatch?.[1] || commentMatch?.[2];

      return { guid: entry.guid, value, comment };
    });

    const filteredCarPLates = carPlateMatches.filter((entry) => entry.value);
    const carPlates = uniqBy(filteredCarPLates, "value");

    const carPlatesToSync = carPlates.map(({ guid, value, comment }) => ({ guid, value, organization, source, comment }));
    const existingCarPlates = await CarPlate.findAll({ where: { organization, source } });

    const [carPlatesToUpdate, carPlatesToCreate, carPLatesToDelete] = differenceBy(carPlatesToSync, existingCarPlates, "value");

    const updateOnDuplicate = ["value", "organization", "source", "comment", "createdAt", "updatedAt"];
    const updated = await CarPlate.bulkCreate(carPlatesToUpdate, { updateOnDuplicate });
    const created = await CarPlate.bulkCreate(carPlatesToCreate);
    const deleted = await CarPlate.destroy({ where: { guid: carPLatesToDelete.map((plate) => plate.guid) } });

    console.log(`Обновлены госномера из календаря 1С (${updated.length} обновлено, ${created.length} добавлено, ${deleted} удалено)!`);
  } catch (error) {
    console.log("Поиск госномеров в календаре 1С не удался.", error);
  }
};

exports.syncWith1c = async () => {
  await exports.syncWith1cWorks();
  await exports.syncWith1cCalendar();
};

exports.syncWith1c();
setInterval(exports.syncWith1c, SYNC_1C_INTERVAL);

exports.create = async (body) => {
  return await CarPlate.create(body);
};

exports.getAll = async (query) => {
  query.limit = 1000;
  const options = utils.query.parse(query, { searchField: "guid" });
  options.attributes = {
    include: [[Sequelize.literal(`CASE "source" WHEN 'manual' THEN 1 WHEN '1cCalendar' THEN 2 WHEN '1cWork' THEN 3 END`), "order"]],
  };
  options.order = [["order"], ["updatedAt", "DESC"]];
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
