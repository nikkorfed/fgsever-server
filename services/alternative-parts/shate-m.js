const _ = require("lodash");
const fs = require("fs/promises");
const slugify = require("slugify");
const axios = require("axios").default;

const { cookie } = require("./utils");

let searchInShateM = async (number, config = {}) => {
  config.externalAnalogs = config.externalAnalogs ?? true;

  // Авторизация
  const authData = { login: "MIKANIA", password: "4996383577", rememberMe: true };
  const authResponse = await axios.post("https://shate-m.ru/Account/Login", authData);

  const cookies = cookie.parseSetCookie(authResponse.headers["set-cookie"]);
  await fs.writeFile(__dirname + "/cookies/shate-m.txt", cookies);

  // Запрос информации об оригинальной запчасти
  const partsResponse = await axios.get("https://shate-m.ru/api/SearchPart/PartsByNumber", {
    params: { number },
    headers: { cookie: cookies },
  });
  const parts = partsResponse.data;

  // Узнаём ID запчасти для BMW
  const originalPart = parts.find((item) => item.tradeMarkName === "BMW");
  const originalPartId = originalPart.id;

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
  const externalAnalogs = externalAnalogsResponse.data;

  // Подготовка запчастей
  const analogs = config.externalAnalogs ? [...internalAnalogs, ...externalAnalogs] : internalAnalogs;
  const result = prepareParts(analogs);

  return result;
};

// TODO: Extract this function to use after picking prices on prepared parts from different suppliers.
// Отделение избранных производителей
let isFavoriteAnalog = (part) => {
  let { tradeMarkName: name, description } = part.partInfo;

  if (
    (description.match(/фильтр воздушный|фильтр салона/i) && name.match(/KNECHT|MANN|MANN-FILTER|BOSCH|CORTECO|MAHLE/i)) ||
    (description.match(/фильтр/i) && name.match(/KNECHT|MANN|MAHLE/i)) ||
    (description.match(/свеча/i) && name.match(/CHAMPION|BOSCH|NGK/i)) ||
    (description.match(/тормоз|датчик|диск|disc/i) && name.match(/ATE|BOSCH|BREMBO|TEXTAR|TRW/i))
  ) {
    return (part.partInfo.favorite = true);
  }
};

// Подготовка запчастей в подходящем формате
let prepareParts = (parts) => {
  const result = {};

  for (let part of parts) {
    let { tradeMarkName: name, description, article: number, itemComment: comment } = part.partInfo;
    let key = slugify(name, { lower: true });

    if (comment?.includes("угольный")) {
      key = "coal-" + key;
      name += ", угольный";
    }

    if (result[key]) continue;

    let price = part["prices"][0];

    result[key] = {
      name: price.deliveryInfo ? name + " (Доставка " + price.deliveryInfo.deliveryDateTimes[1].deliveryDate + ")" : name,
      description,
      number,
      price: price["price"] * 1.3,
    };
  }

  return result;
};

module.exports = searchInShateM;
