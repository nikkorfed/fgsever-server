const soap = require("soap");

const { prepareResult, catchError } = require("./utils");

const url = "https://parts.major-auto.ru:8066/PartsProcessing.asmx?WSDL";
const identificator = "740B6A56-A0BB-414B-8FCC-7EAAFB439681";

let searchInMajorAutoAPI = catchError(async (numbers, config = {}) => {
  config.searchOriginals ??= numbers.split(",");

  // Запрос запчастей
  const client = await soap.createClientAsync(url);
  const partsResponse = await client.GetAvailabilityAsync({
    request: {
      Authority: { ConsumerID: identificator },
      Options: {},
      Rows: { Row: config.searchOriginals.map((number) => ({ PartNo: number })) },
    },
  });
  const [partsData] = partsResponse;

  // Оригинальные запчасти
  const originalParts = partsData.GetAvailabilityResult.Rows?.Row ?? [];

  // Подготовка запчастей
  const parts = [...originalParts];
  const result = prepareResult(parseParts(parts), config);
  if (Object.values(result).some((part) => !part?.price)) debugger;

  return result;
});

let parseParts = (parts) => {
  return parts.map((part) => {
    let name = part.Part[0].PartInfo.PartsGroupName;
    let description = part.Part[0].PartInfo.PartName;
    let number = part.PartNo;

    let price = part.Part[0].Price.PricePurchase;
    let available = part.Part[0].Availabilities.Availability.some((item) => item.QTY !== 0);

    return {
      name,
      description,
      number,
      price,
      available,
      from: "major-auto",
    };
  });
};

module.exports = searchInMajorAutoAPI;
