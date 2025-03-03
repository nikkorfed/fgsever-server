const axios = require("axios");
const moment = require("moment");
const querystring = require("querystring");

const { prepareResult, catchError } = require("./utils");

const username = "RIVERDALE@inbox.ru";
const password = "bmwsever72";

const shippingOrganization = "4000";
const client = "43252691";

let searchInArmtekAPI = catchError(async (number, config = {}) => {
  config = {
    originalParts: config.originalParts ?? false,
    externalAnalogs: config.externalAnalogs ?? false,
    onlyFavorites: config.onlyFavorites ?? false,
    originalNumber: number,
    skipNotAvailable: true,
  };

  // Поиск оригинальной запчасти
  const brandsResponse = await axios.post(
    "http://ws.armtek.ru/api/ws_search/assortment_search",
    querystring.encode({ VKORG: shippingOrganization, PIN: number }),
    { auth: { username, password }, params: { format: "json" } }
  );
  const brandsData = brandsResponse.data.RESP;

  // Взятие оригинальной запчасти
  const originalPart = brandsData.find((part) => part.BRAND === "BMW");
  const brand = originalPart.BRAND;

  // Поиск запчастей
  const partsResponse = await axios.post(
    "http://ws.armtek.ru/api/ws_search/search",
    querystring.encode({ VKORG: shippingOrganization, KUNNR_RG: client, PIN: number, BRAND: brand }),
    { auth: { username, password }, params: { format: "json" } }
  );
  const partsData = partsResponse.data.RESP;

  // Оригинальные запчасти и аналоги
  const originalParts = config.originalParts ? partsData.filter((part) => !part.ANALOG) : [];
  const internalAnalogs = partsData.filter((part) => part.ANALOG && !+part.PARNR);
  const externalAnalogs = config.externalAnalogs ? partsData.filter((part) => part.ANALOG && +part.PARNR) : [];

  // Подготовка запчастей
  const parts = [...originalParts, ...internalAnalogs, ...externalAnalogs];
  const result = prepareResult(parseParts(parts), config);

  debugger;

  return result;
});

let parseParts = (parts) => {
  return parts.map((part) => {
    let name = part.BRAND;
    let description = part.NAME;
    let number = part.PIN;

    let price = part.PRICE;
    let shipping = moment(part.DLVDT, "YYYYMMDDHHmmss").format("DD.MM");
    let available = +part.RVALUE.replace(/\D/g, "");

    return {
      name,
      description,
      number,
      price,
      shipping,
      available,
      from: "armtek",
    };
  });
};

module.exports = searchInArmtekAPI;
