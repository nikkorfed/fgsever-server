const { uniq, uniqBy } = require("lodash");
const { UUIDV4 } = require("sequelize");

const { CarPlate } = require("../../models");
const { odata } = require("../../api");
const utils = require("../../utils");

const CAR_PLATE_REGEXP = /[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}/iu;
const SYNC_1C_INTERVAL = 1000 * 60 * 2; // 2 минуты

exports.syncWith1cWorks = async () => {
  try {
    const latestWorks = await odata.works(true);
    if (!latestWorks.length) return;

    const carGuids = uniq(latestWorks.map((work) => work.carGuid));
    const carPlates = uniqBy(await odata.carPlates(carGuids), "guid");

    const deleted = await CarPlate.destroy({ where: { organization: "fgsever", source: "1cWork" } });
    await CarPlate.bulkCreate(
      carPlates.map((plate) => ({
        ...plate,
        organization: "fgsever",
        source: "1cWork",
        status: latestWorks.find((work) => work.carGuid === plate.guid).status,
      }))
    );
    console.log(`Обновлены госномера из заказ-нарядов 1С (${carPlates.length} добавлено, ${deleted} удалено)!`);
  } catch (error) {
    console.log("Поиск госномеров в заказ-нарядах 1С не удался.", error);
  }
};

exports.syncWith1cCalendar = async () => {
  try {
    const latestCalendar = await odata.calendar();
    if (!latestCalendar.length) return;

    const carPlateMatches = latestCalendar.map((entry) => ({
      guid: entry.guid,
      value: entry.description.match(CAR_PLATE_REGEXP)?.[0]?.toUpperCase(),
    }));
    const filteredCarPLates = carPlateMatches.filter((entry) => entry.value);
    const carPlates = uniqBy(filteredCarPLates, "value");

    const deleted = await CarPlate.destroy({ where: { organization: "fgsever", source: "1cCalendar" } });
    await CarPlate.bulkCreate(carPlates.map(({ guid, value }) => ({ guid, value, organization: "fgsever", source: "1cCalendar" })));

    console.log(`Обновлены госномера из календаря 1С (${carPlates.length} добавлено, ${deleted} удалено)!`);
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
