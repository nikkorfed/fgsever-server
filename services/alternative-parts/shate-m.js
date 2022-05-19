const _ = require("lodash");
const fs = require("fs/promises");
const axios = require("axios").default;

const { cookie, prepareResult } = require("./utils");

let searchInShateM = async (number, config = {}) => {
  config.originalParts = config.originalParts ?? true;
  config.externalAnalogs = config.externalAnalogs ?? true;
  config.onlyFavorites = config.onlyFavorites ?? false;
  config.originalNumber = number;

  // Авторизация
  const authData = { login: "MIKANIA", password: "4996383577", rememberMe: true };
  const authResponse = await axios.post("https://shate-m.ru/Account/Login", authData);

  const cookies = cookie.parseSetCookie(authResponse.headers["set-cookie"]);
  await fs.writeFile(__dirname + "/cookies/shate-m.txt", cookies);

  // Запрос информации о запчастях по производителям
  const brandPartsResponse = await axios.get("https://shate-m.ru/api/SearchPart/PartsByNumber", {
    params: { number },
    headers: { cookie: cookies },
  });
  const brandParts = brandPartsResponse.data;

  // Узнаём ID запчасти для BMW
  const originalPart = brandParts.find((item) => item.tradeMarkName === "BMW");
  const originalPartId = originalPart.id;

  // Запрос оригинальных запчастей
  const internalOriginalPartsResponse = await axios.get("https://shate-m.ru/api/searchPart/GetOriginalsInternalPrices", {
    params: { partId: originalPartId },
    headers: { cookie: cookies },
  });
  const externalOriginalPartsResponse = await axios.get("https://shate-m.ru/api/searchPart/GetOriginalsExternalPrices", {
    params: { partId: originalPartId },
    headers: { cookie: cookies },
  });
  const originalParts = config.originalParts ? [...internalOriginalPartsResponse.data, ...externalOriginalPartsResponse.data] : [];

  // Запрос аналогов c собственных складов shate-m
  const internalAnalogsResponse = await axios.get("https://shate-m.ru/api/searchPart/GetAnalogsInternalPrices", {
    params: { partId: originalPartId },
    headers: { cookie: cookies },
  });
  const internalAnalogs = internalAnalogsResponse.data;

  // Запрос аналогов у сторонних поставщиков
  const externalAnalogsResponse = await axios.get("https://shate-m.ru/api/searchPart/GetAnalogsExternalPrices", {
    params: { partId: originalPartId },
    headers: { cookie: cookies },
  });
  const externalAnalogs = config.externalAnalogs ? externalAnalogsResponse.data : [];

  // Подготовка запчастей
  const parts = [...originalParts, ...internalAnalogs, ...externalAnalogs];
  const result = prepareResult(parseParts(parts), config);

  return result;
};

let parseParts = (parts) => {
  return parts.map((part) => {
    let { tradeMarkName: name, description, article: number, itemComment: comment } = part.partInfo;
    let { price, deliveryInfo } = part.prices?.[0] ?? {};
    let shipping = deliveryInfo?.deliveryDateTimes[1].deliveryDate;

    return {
      name,
      description: [description, comment].join(" ").trim(),
      number,
      price,
      shipping,
      from: "shate-m",
    };
  });
};

module.exports = searchInShateM;
