const moment = require("moment");
const { uniq } = require("lodash");

const { Work } = require("../../models");
const { notifications } = require("../../services/api");
const { odata } = require("~/api");
const utils = require("~/utils");

exports.findNewWorks = async () => {
  try {
    const works = await odata.works();
    const existingWorks = await Work.findAll({ attributes: ["guid"] });
    const existingWorksKeys = Object.fromEntries(existingWorks.map((work) => [work.guid, true]));

    const newWorks = works.filter((work) => !existingWorksKeys[work.guid]);
    const sortedNewWorks = newWorks.sort((a, b) => +moment(a.date) - +moment(b.date));
    if (!newWorks.length) return;

    await Work.bulkCreate(sortedNewWorks);
    console.log(`Было найдено ${newWorks.length} новых заказ-нарядов!`);

    const carGuids = uniq(newWorks.map((item) => item.carGuid));
    const carsResponse = await odata.cars(carGuids); // TODO: Запрашивать машины чанками (для массового нахождения новых заказ-нарядов)

    const carsByGuids = {};
    carsResponse.forEach((item) => (carsByGuids[item.guid] = item));
    newWorks.forEach((item) => (item.car = carsByGuids[item.carGuid]));

    for (const work of newWorks) {
      await notifications.sendToMasters({
        type: "addNewWork",
        title: "Принят автомобиль",
        body: `В работу принят автомобиль ${work.car.name} по заказ-наряду № ${work.number}.`,
      });
    }
  } catch (error) {
    console.log("Поиск новых заказ-нарядов не удался.", error);
  }
};

exports.findNewWorks();
setInterval(exports.findNewWorks, 60 * 1000);

exports.create = async (body) => {
  return await Work.create(body);
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "guid" });
  return await Work.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await Work.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const work = await Work.findByPk(guid);
  return await work.update(body);
};

exports.deleteById = async (guid) => {
  const work = await Work.findByPk(guid);
  return await work.destroy();
};
