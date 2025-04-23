const soap = require("soap");

const { prepareResult, catchError } = require("./utils");

const url = "https://parts.major-auto.ru:8066/PartsProcessing.asmx?WSDL";
const identificator = "{88CBC883-8F8D-4E9E-84F0-D725732EE4DA}";

let searchInMajorAutoAPI = catchError(async (numbers, config = {}) => {
  config.searchOriginals ??= numbers.split(",");

  // Запрос запчастей
  const client = await soap.createClientAsync(url);
  const description = client.describe();
  const partsResponse = await client.GetAvailabilityAsync({
    request: {
      Authority: { ConsumerID: identificator },
      Rows: [{ PartNo: "11428575211" }],
    },
  });
  const [partsResult] = partsResponse;
  console.log("RESULT:", partsResult);
  debugger;

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
