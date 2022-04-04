const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs").promises;

const headless = process.env.HEADLESS === "true";

let getCarInfoFromCats = async (vin) => {
  if (!(vin.length == 7 || vin.length == 17)) return { error: "wrong-vin" };

  let cache = await fs
    .access(__dirname + `/cache/${vin}.json`)
    .then((result) => true)
    .catch((error) => false);
  if (cache) {
    console.log(`[${vin}] Данные автомобиля взяты из кэша!`);
    return JSON.parse(await fs.readFile(__dirname + `/cache/${vin}.json`));
  }

  console.log(`[${vin}] Поиск данных автомобиля...`);
  let result = {},
    tryCatsParts = false,
    catsPartsTries = 0;
  // isLoginPage = false,
  // tryLoginAIR = false,
  // loginAIRTries = 0;

  // Запуск браузера

  const browser = await puppeteer.launch({
    headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    slowMo: 20,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "ru-RU" });
  page.on("dialog", async (dialog) => await dialog.dismiss());

  // Поиск данных на cats.parts

  do {
    try {
      catsPartsTries++;

      await page.goto("https://cats.parts/");
      await page.waitForNetworkIdle();
      await page.type("input#search-vin", vin);
      await page.click(`a#search-vin-btn`);
      await page.waitForNetworkIdle();

      result.image = await page.$eval(".etk-mospid-carinfo-image img", (image) => image.src);
      result.model = await page.$eval(".etk-mospid-carinfo-text .div-tr:first-child .etk-mospid-carinfo-value", (e) => e.textContent);

      await page.click(".bmw-catalog-vin-decode-see a").catch(() => {});
      await page.waitForNetworkIdle();

      const info = await page
        .$$eval(".bmw-asap-carinfo-table .div-tr", (rows) => {
          let entries = rows.map((row) => [row.querySelector(".div-td-name").textContent, row.querySelector(".div-td-value").textContent]);
          return Object.fromEntries(entries);
        })
        .catch(() => ({}));

      result.vin = info["VIN"] ?? vin;
      result.modelCode = info["Серия"]?.trim();
      result.productionDate = info["Изготовлено"] && moment(info["Изготовлено"]).format("DD.MM.YYYY");

      const options = await page.$$eval(".bmw-asap-carinfo-options-table .div-tr", (rows) => {
        let entries = rows.map((row) => [
          row.querySelector(".div-td-opt-code")?.textContent,
          row.querySelector(".div-td-opt-value")?.textContent,
        ]);
        return Object.fromEntries(entries);
      });

      result.options = { factory: options, installed: {} };
      tryCatsParts = false;
    } catch (err) {
      console.log(`[${vin}] В cats.parts что-то пошло не так :(`);
      console.log(`[${vin}]`, err);
      tryCatsParts = true;
    }

    if (catsPartsTries == 3) break;
  } while (tryCatsParts);

  // Завершение работы браузера и возврат найденных данных

  await browser.close();
  if (Object.keys(result).length) {
    console.log(`[${vin}] Данные автомобиля в cats.parts успешно найдены!`);
    fs.writeFile(__dirname + `/cache/${vin}.json`, JSON.stringify(result));
    return result;
  } else {
    console.log(`[${vin}] Данные автомобиля найти не удалось!`);
    return { error: "car-info-not-found" };
  }
};

module.exports = getCarInfoFromCats;
