const axios = require("axios");
const moment = require("moment");

const { prepareCar, prepareCarPlate } = require("../helpers/cars");
const { prepareWork } = require("../helpers/works");

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

exports.works = async (onlyNew = false) => {
  const statusFilter = onlyNew ? ["Состояние eq 'Заявка'", "Состояние eq 'Ожидание'"].join(" or ") : "";
  const monthAgo = moment().utc(true).startOf("day").subtract(1, "month");
  const dateFilter = onlyNew ? `Date gt datetime'${monthAgo.format().slice(0, -1)}'` : "";
  const filters = mergeFilters(statusFilter, dateFilter);

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

exports.carPlates = async (carGuids = []) => {
  const carsFilter = carGuids.map((guid) => `Автомобиль_Key eq guid'${guid}'`).join(" or ");
  const typeFilter = "ВидЗначения eq 'ГосНомер'";
  const filters = mergeFilters(carsFilter, typeFilter);

  const response = await oDataApi.get("/InformationRegister_асАвтомобили", { params: { $filter: filters, $orderby: "Period desc" } });
  return response.data.value.map(prepareCarPlate);
};
