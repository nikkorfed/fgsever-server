const axios = require("axios");

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

exports.works = async () => {
  const response = await oDataApi.get(`/Document_асЗаказНаряд`, { params: { $select: "Ref_Key,Date", $orderby: "Date desc" } });
  return response.data.value.map(prepareWork);
};
