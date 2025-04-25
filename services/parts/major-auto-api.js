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
  const [partsResult] = partsResponse;
  console.log(JSON.stringify(partsResult, null, 2));

  // Оригинальные запчасти
  const originalParts = [];

  // Подготовка запчастей
  const parts = [...originalParts];
  const result = prepareResult(parseParts(parts), config);
  if (Object.values(result).some((part) => !part?.price)) debugger;

  return result;
});

let parseParts = (parts) => {
  return parts.map((part) => {
    const $ = cheerio.load(part);

    let name = $("td:nth-child(2) .group-name").text();
    let description = $("td:nth-child(3)").text().replaceAll("/n", "").trim();
    let number = $("td:nth-child(2) .search-part, td:nth-child(2) .part-main").first().text().trim();

    let price = +$("td:nth-child(5) [id*=priceItemLbl]").text().replace(/\s/g, "").replace(",", ".");
    let available = $("td:nth-child(8)").text().trim() === "доступно";

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
