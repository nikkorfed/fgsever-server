const utils = require("~/utils");

const { Request } = require("../../models");
const { notifications } = require("../../services/api");
const { odata } = require("../../api");

exports.create = async (body) => {
  const request = await Request.create(body);

  const work = await odata.getWork(request.workGuid);
  const [car] = await odata.cars([work.carGuid]);

  if (request.type === "carWash") {
    await notifications.sendToMasters({
      type: "requestCarWash",
      title: "Нужна мойка",
      body: `Заказчик запросил мойку автомобиля ${car.name} по заказ-наряду № ${work.number}.`,
    });
  }

  return request;
};

exports.getAll = async (query) => {
  const options = utils.query.parse(query, { searchField: "guid" });
  return await Request.findAll(options);
};

exports.getById = async (guid, query) => {
  const options = utils.query.parse(query);
  return await Request.findByPk(guid, options);
};

exports.updateById = async (guid, body) => {
  const request = await Request.findByPk(guid);

  const work = await odata.getWork(request.workGuid);
  const [car] = await odata.cars([work.carGuid]);

  if (request.type === "testDrive" && body.status === "approved") {
    await notifications.sendToMasters({
      type: "approveTestDrive",
      title: "Тест-драйв разрешен",
      body: `Заказчик разрешил тестовую поездку на автомобиле ${car.name} по заказ-наряду № ${work.number}.`,
    });
  }

  if (request.type === "testDrive" && body.status === "rejected") {
    await notifications.sendToMasters({
      type: "rejectTestDrive",
      title: "Тест-драйв не нужен",
      body: `Заказчик попросил не проводить тестовую поездку на автомобиле ${car.name} по заказ-наряду № ${work.number}.`,
    });
  }

  return await request.update(body);
};

exports.deleteById = async (guid) => {
  const request = await Request.findByPk(guid);
  return await request.destroy();
};
