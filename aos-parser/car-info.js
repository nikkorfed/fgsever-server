const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs").promises;

const headless = process.env.HEADLESS === "true";

let getCarInfo = async (vin) => {
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

  // Поиск данных на cats.parts

  do {
    try {
      catsPartsTries++;

      await page.goto("https://cats.parts/");
      await page.waitForNetworkIdle();
      await page.type("input#search-vin", vin);
      await page.click(`a#search-vin-btn`);

      page.on("dialog", async (dialog) => await dialog.dismiss());
      await page.waitForNetworkIdle();

      await page.click(".bmw-catalog-vin-decode-see a");
      await page.waitForNetworkIdle();

      result.image = await page.$eval(".etk-mospid-carinfo-image img", (image) => image.src);
      result.model = await page.$eval(".etk-mospid-carinfo-text .div-tr:first-child .etk-mospid-carinfo-value", (e) => e.textContent);

      const info = await page.$$eval(".bmw-asap-carinfo-table .div-tr", (rows) => {
        let entries = rows.map((row) => [row.querySelector(".div-td-name").textContent, row.querySelector(".div-td-value").textContent]);
        return Object.fromEntries(entries);
      });

      result.vin = info["VIN"];
      result.modelCode = info["Серия"].trim();
      result.productionDate = moment(info["Изготовлено"]).format("DD.MM.YYYY");

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

  do {
    try {
      loginAIRTries++;

      // Авторизация в AOS

      if (tryLoginAIR && isLoginPage) {
        console.log(`[${vin}] Оказались на AOS Login. Заново авторизуемся...`);
        await page.goto("https://aos.bmwgroup.com/group/oss/start");
        await page.waitForNetworkIdle();
        await page.type("input[autocomplete=username]", process.env.AOS_USER);
        await page.type("input[autocomplete=current-password]", process.env.AOS_PASSWORD);
        await page.click(`input[value="Войти в систему"]`);
        await page.waitForNetworkIdle();
        console.log(`[${vin}] Авторизация выполнена`);
      }

      // Переход в AIR

      if (tryLoginAIR) {
        console.log(`[${vin}] Повторный переход в AIR...`);
        await page.goto("https://onl-osmc-b2i.bmwgroup.com/osmc/b2i/air/start.html?navigation=true&amp;langLong=ru-RU", { timeout: 10000 });
        await page.waitForNetworkIdle();
        isLoginPage = await page.$eval("title", (title) => title.textContent == "WEB-EAM Next");
        await page.goto(await page.evaluate('document.getElementById("startlink").getAttribute("href")'), { timeout: 10000 });
        let cookies = JSON.stringify(await page.cookies(), null, 2);
        await fs.writeFile(__dirname + "/cookies/air.cookies", cookies);
        console.log(`[${vin}] Переход в AIR выполнен`);
      }

      // Подключение cookie

      if (!tryLoginAIR) {
        let cookies = await fs.readFile(__dirname + "/cookies/air.cookies");
        cookies = JSON.parse(await cookies);
        await page.setCookie(...cookies);
      } else tryLoginAIR = false;

      // Ввод VIN и переход на страницу автомобиля в AIR

      await page.goto("https://myair-bdr.bmwgroup.com/air/faces/xhtml/Start.xhtml?guid=");
      await page.waitForNetworkIdle();
      isLoginPage = await page.$eval("title", (title) => title.textContent == "WEB-EAM Next");
      await page.type(".air-vinsearch-field", vin);
      await page.click(".air-vinsearch-button");
      await page.waitForTimeout(500);

      if (await page.$(".air-vinsearch-feedback-vinnotfound")) {
        console.log(`[${vin}] Данный VIN не найден!`);
        await browser.close();
        return { error: "vin-not-found" };
      }

      let cars = await page.$$(".ui-datatable-tablewrapper tbody tr[data-ri]");
      if (cars.length) {
        console.log(`[${vin}] По данному VIN найдено несколько автомобилей!`);
        cars = await page.$$eval(".ui-datatable-tablewrapper tbody tr[data-ri]", (rows) =>
          rows.map((row) => {
            return {
              vin: row.childNodes[6].textContent,
              model: row.childNodes[2].textContent,
              modelCode: row.childNodes[1].textContent,
              productionDate: row.childNodes[4].textContent,
            };
          })
        );
        await browser.close();
        return { error: "multiple-cars-founded", cars };
      }

      await page.waitForSelector(".air-sonderausstattung", { timeout: 2000 });
      const content = await page.content();

      // Поиск и сохранение данных автомобиля

      const $ = cheerio.load(await content);

      result["image"] = $(".air-cosy-frame img").attr("src");
      $(".air-accordion-table-row").each(function () {
        switch ($(this).find(".air-accordion-table-label").text()) {
          case "VIN (17-значный)":
          case "Vehicle identification number (17 characters)":
            result["vin"] = $(this).find(".air-accordion-table-text").text().trim();
            break;
          case "Модель":
          case "Model":
            result["model"] = $(this).find(".air-accordion-table-text").text().trim();
            break;
          case "Внутризаводское обозначение серии":
          case "Development code":
            result["modelCode"] = $(this).find(".air-accordion-table-text").text().trim();
            break;
          case "Дата изготовления":
          case "Production date":
            result["productionDate"] = $(this).find(".air-accordion-table-text").text().trim();
            break;
        }
      });

      result["options"] = {
        factory: {},
        installed: {},
      };

      $(".air-sonderausstattungen-table-data td:first-child .air-sonderausstattung").each(function () {
        let code = $(this).find(".air-sonderausstattung-code").text();
        let text = $(this).find(".air-sonderausstattung-text").text();
        result["options"]["factory"][code] = text;
      });
      $(".air-sonderausstattungen-table-data td:last-child .air-sonderausstattung").each(function () {
        let code = $(this).find(".air-sonderausstattung-code").text();
        let text = $(this).find(".air-sonderausstattung-text").text();
        result["options"]["installed"][code] = text;
      });
    } catch (err) {
      console.log(`[${vin}] В AIR что-то пошло не так :(`);
      console.log(`[${vin}]`, err);
      tryLoginAIR = true;
    }

    if (loginAIRTries == 3) break;
  } while (tryLoginAIR);

  // Завершение работы браузера и возврат найденных данных

  await browser.close();
  if (Object.keys(result).length) {
    console.log(`[${vin}] Данные автомобиля в AIR успешно найдены!`);
    fs.writeFile(__dirname + `/cache/${vin}.json`, JSON.stringify(result));
    return result;
  } else {
    console.log(`[${vin}] Данные автомобиля найти не удалось!`);
    return { error: "car-info-not-found" };
  }
};

module.exports = getCarInfo;
