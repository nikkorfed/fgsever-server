const _ = require("lodash");
const fs = require("fs/promises");
const axios = require("axios").default;

const { cookie, prepareResult, catchError } = require("./utils");

let searchInShateM = catchError(async (number, config = {}) => {
  config = {
    originalParts: config.originalParts ?? false,
    externalAnalogs: config.externalAnalogs ?? true,
    onlyFavorites: config.onlyFavorites ?? false,
    originalNumber: number,
    skipNotAvailable: true,
  };

  // Авторизация
  const authData = { login: "MIKANIA", password: "4996383577", rememberMe: true };
  const authResponse = await axios.post("https://shate-m.ru/Account/Login", authData);

  const cookies = cookie.parseSetCookie(authResponse.headers["set-cookie"]);
  await fs.writeFile(__dirname + "/cookies/shate-m.txt", cookies);

  // Получение кода для запросов запчастей
  const agreementCodeResponse = await axios.get("https://shate-m.ru/api/finance/getCustomerBalances", { headers: { cookie: cookies } });
  const agreement = agreementCodeResponse.data.agreementsForBalance[0].code;

  // Запрос информации о запчастях по производителям
  const brandPartsResponse = await axios.get("https://shate-m.ru/api/searchPart/liveSearch", {
    params: { query: number },
    headers: { cookie: cookies },
  });
  const brandParts = brandPartsResponse.data;

  // Узнаём ID запчасти для BMW
  const originalPart = brandParts.find((item) => item.tradeMark === "BMW");
  const originalPartId = originalPart.partId;

  // Запрос оригинальных запчастей
  const internalOriginalPartsResponse = await axios.get("https://shate-m.ru/api/searchPart/GetOriginalsInternalPrices", {
    params: { agreement, partId: originalPartId },
    headers: { cookie: cookies },
  });
  const originalParts = config.originalParts ? internalOriginalPartsResponse.data : [];

  // Запрос аналогов c собственных складов shate-m
  const internalAnalogsResponse = await axios.get("https://shate-m.ru/api/searchPart/GetAnalogsInternalPrices", {
    params: { agreement, partId: originalPartId },
    headers: { cookie: cookies },
  });
  const internalAnalogs = internalAnalogsResponse.data;

  // Запрос аналогов у сторонних поставщиков
  const externalAnalogsResponse = await axios.get("https://shate-m.ru/api/searchPart/GetAnalogsExternalPrices", {
    params: { agreement, partId: originalPartId },
    headers: { cookie: cookies },
  });
  const externalAnalogs = config.externalAnalogs ? externalAnalogsResponse.data : [];

  // Подготовка запчастей
  const parts = [...originalParts, ...internalAnalogs, ...externalAnalogs];
  const result = prepareResult(parseParts(parts), config);

  return result;
});

let parseParts = (parts) => {
  return parts.map((part) => {
    let { tradeMarkName: name, description, article: number, itemComment: comment } = part.partInfo;
    let { deliveryInfo, price, availability } = part.prices?.[0] ?? {};
    let shipping = deliveryInfo?.deliveryDateTimes[1].deliveryDate;
    let available = +availability.replace(/\D/g, "") > 0;

    return {
      name,
      description: [description, comment].join(" ").trim(),
      number,
      price,
      shipping,
      available,
      from: "shate-m",
    };
  });
};

module.exports = searchInShateM;
