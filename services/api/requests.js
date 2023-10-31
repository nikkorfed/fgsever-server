const utils = require("~/utils");

const { Request, Employee } = require("../../models");
const { notifications } = require("../../services/api");
const { odata } = require("../../api");

exports.create = async (body) => {
  const request = await Request.create(body);

  if (request.type === "carWash") {
    const work = await odata.getWork(request.refGuid);
    const [car] = await odata.cars([work.carGuid]);

    await notifications.sendToMasters({
      type: "requestCarWash",
      title: "Нужна мойка",
      body: `Заказчик запросил мойку автомобиля ${car.name} по заказ-наряду № ${work.number}.`,
    });
  }

  if (request.type === "resetPassword") {
    const employee = await Employee.findByPk(request.refGuid);

    await notifications.sendToDirectors({
      type: "requestResetPassword",
      title: "Запрошен сброс пароля",
      body: `Сотрудник ${employee.name} запросил сброс пароля для своего аккаунта.`,
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

  if (request.type === "testDrive" && body.status === "approved") {
    const work = await odata.getWork(request.refGuid);
    const [car] = await odata.cars([work.carGuid]);

    await notifications.sendToMasters({
      type: "approveTestDrive",
      title: "Тест-драйв разрешен",
      body: `Заказчик разрешил тестовую поездку на автомобиле ${car.name} по заказ-наряду № ${work.number}.`,
    });
  }

  if (request.type === "testDrive" && body.status === "rejected") {
    const work = await odata.getWork(request.refGuid);
    const [car] = await odata.cars([work.carGuid]);

    await notifications.sendToMasters({
      type: "rejectTestDrive",
      title: "Тест-драйв не нужен",
      body: `Заказчик попросил не проводить тестовую поездку на автомобиле ${car.name} по заказ-наряду № ${work.number}.`,
    });
  }

  if (request.type === "resetPassword" && body.status === "completed") {
    const employee = await Employee.findByPk(request.refGuid);
    await employee.destroy();
  }

  return await request.update(body);
};

exports.deleteById = async (guid) => {
  const request = await Request.findByPk(guid);
  return await request.destroy();
};
