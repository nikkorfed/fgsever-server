const axios = require("axios");
const moment = require("moment");

const { prepareResult, catchError } = require("./utils");

const email = "riverdale@inbox.ru";
const password = "OC321v0rw4ZCqgFrSQSboiTA";

const key = "Lha0rSu5pJI8AsSfTaGJ2EVJgMbmkIxU7IAN1O1GfcR3dViwtMMEH2vj0HYH";
const deliveryKey = "hMRG1NqRbDmVvfGrHAUlgA0vlUZgRhN04SG01sixtCpoTjC99FJ165xxzGta89mwhLNonRBxH1vlOg8rjL2xPxAdurElATA";

let searchInAutoEuroAPI = catchError(async (number, config = {}) => {
  config = {
    originalParts: config.originalParts ?? false,
    externalAnalogs: config.externalAnalogs ?? true,
    onlyFavorites: config.onlyFavorites ?? false,
    originalNumber: number,
    skipNotAvailable: true,
  };

  // Поиск бренда по коду
  const brandsResponse = await axios.get("http://api.autoeuro.ru/api/v2/json/search_brands/", { params: { key, code: number } });
  const brandsData = brandsResponse.data.DATA;

  // Взятие оригинальной запчасти
  const originalPart = brandsData.find((part) => part.brand === "BMW");
  const brand = originalPart.brand;

  // Поиск запчастей
  const partsResponse = await axios.get("http://api.autoeuro.ru/api/v2/json/search_items/", {
    params: {
      key,
      brand,
      code: number,
      delivery_key: deliveryKey,
      with_crosses: 1,
      with_offers: config.externalAnalogs ? 1 : 0,
    },
  });
  const partsData = partsResponse.data.DATA;

  // Оригинальные запчасти и аналоги
  const originalParts = config.originalParts ? partsData.filter((part) => part.cross === null) : [];
  const analogs = partsData.filter((part) => part.cross !== null);

  // Подготовка запчастей
  const parts = [...originalParts, ...analogs];
  const result = prepareResult(parseParts(parts), config);

  return result;
});

let parseParts = (parts) => {
  return parts.map((part) => {
    let name = part.brand;
    let description = part.name;
    let number = part.code;

    let price = part.price;
    let shipping = moment(part.delivery_time).format("DD.MM");
    let available = part.amount > 0;

    return {
      name,
      description,
      number,
      price,
      shipping,
      available,
      from: "auto-euro",
    };
  });
};

module.exports = searchInAutoEuroAPI;
