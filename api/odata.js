const axios = require("axios");
const moment = require("moment");

const { prepareCar, prepareCarPlate, prepareCalendarEntry } = require("../helpers/cars");
const { prepareWork } = require("../helpers/works");
const { chunkRequest } = require("../helpers/requests");

const odataApiUrl = process.env.ODATA_API_URL;

const serializer = (params) => {
  const entries = Object.entries(params);
  return encodeURI(entries.map(([key, value]) => `${key}=${value}`).join("&"));
};

const oDataApi = axios.create({
  baseURL: odataApiUrl,
  auth: { username: "приложение", password: "bmwf30" },
  params: { $format: "json" },
  paramsSerializer: { serialize: serializer },
});

const mergeFilters = (...items) => {
  let filters = items.filter((i) => i);
  filters.length > 1 && (filters = filters.map((filter) => `(${filter})`));
  return filters.join(" and ");
};

exports.works = async (latest = false) => {
  // const statusFilter =
  //   latest &&
  //   [
  //     "Состояние eq 'Заявка'",
  //     "Состояние eq 'Ожидание'",
  //     "Состояние eq 'Выполнен'", // TODO: Возможно, добавить фильтр по дате за последнюю неделю именно к этому статусу
  //     "Состояние eq 'Закрыт'", // TODO: Возможно, добавить фильтр по дате за последнюю неделю именно к этому статусу
  //   ].join(" or ");
  const weekAgo = moment().utc(true).startOf("day").subtract(1, "week");
  const dateFilter = latest && `Date gt datetime'${weekAgo.format().slice(0, -1)}'`;
  const filters = mergeFilters(dateFilter);

  const select = "Ref_Key,Number,Состояние,Автомобиль_Key,Date";

  const response = await oDataApi.get(`/Document_асЗаказНаряд`, { params: { $filter: filters, $select: select, $orderby: "Date desc" } });
  return response.data.value.map(prepareWork);
};

exports.getWork = async (guid) => {
  const response = await oDataApi.get(`/Document_асЗаказНаряд(guid'${guid}')`);
  return prepareWork(response.data);
};

exports.cars = async (guids) => {
  const filters = guids.map((guid) => `Ref_Key eq guid'${guid}'`).join(" or ");
  const response = await oDataApi.get("/Catalog_асАвтомобили", { params: { $filter: filters } });
  return response.data.value.map(prepareCar);
};

exports.carPlates = chunkRequest(async (carGuids = []) => {
  const carsFilter = carGuids.map((guid) => `Автомобиль_Key eq guid'${guid}'`).join(" or ");
  const typeFilter = "ВидЗначения eq 'ГосНомер'";
  const filters = mergeFilters(carsFilter, typeFilter);

  const response = await oDataApi.get("/InformationRegister_асАвтомобили", { params: { $filter: filters, $orderby: "Period desc" } });
  return response.data.value.map(prepareCarPlate);
});

exports.calendar = async () => {
  const calendarGuids = ["111edca7-2665-11e6-848a-002354bb1d74", "e8ef19f8-1ddf-11e8-8632-2c4d54ee8471"];
  const calendarFilter = calendarGuids.map((guid) => `Календарь_Key eq guid'${guid}'`).join(" or ");
  const weekAgo = moment().utc(true).startOf("day").subtract(1, "week");
  const dateFilter = `Начало gt datetime'${weekAgo.format().slice(0, -1)}'`;
  const filters = mergeFilters(calendarFilter, dateFilter);

  const response = await oDataApi.get("/Catalog_ЗаписиКалендаряСотрудника", { params: { $filter: filters, $orderby: "Начало desc" } });
  return response.data.value.map(prepareCalendarEntry);
};
