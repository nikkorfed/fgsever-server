const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs").promises;
const path = require("path");
const telegram = require("~/utils/telegram");

const headless = process.env.HEADLESS === "true";

let getCarInfoFromSgateAir = async (vin) => {
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
    isLoginPage = false,
    authMessage,
    tryLoginAIR = false,
    loginAIRTries = 0;

  const config = await fs
    .readFile(__dirname + "/data/config.json")
    .then(JSON.parse)
    .catch(() => null);
  if (config?.aosStopped) {
    console.log(`[${vin}] Поиск в AOS временно отключен!`);
    return { error: "car-info-not-found" };
  }

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

  // Поиск данных в AIR

  do {
    try {
      loginAIRTries++;

      // Авторизация через S-Gate

      if (tryLoginAIR && isLoginPage) {
        console.log(`[${vin}] Оказались на WEB-EAM Next. Заново авторизуемся...`);

        await page.type("input[autocomplete=username]", process.env.AOS_USER);
        await page.type("input[autocomplete=current-password]", process.env.AOS_PASSWORD);
        await page.click(`input[value="Войти в систему"]`);
        await page.waitForNetworkIdle();
        isLoginPage = await page.$eval("title", (title) => title.textContent == "WEB-EAM Next");
        authMessage = await page.$eval("#callback_0", (element) => element.textContent).catch(() => null);
        let cookies = JSON.stringify(await page.cookies(), null, 2);
        await fs.writeFile(__dirname + "/cookies/air.cookies", cookies);
        console.log(`[${vin}] Авторизация выполнена`);
      }

      // Подключение cookie

      if (!tryLoginAIR) {
        let cookies = JSON.parse(await fs.readFile(__dirname + "/cookies/air.cookies"));
        await page.setCookie(...cookies);
      } else tryLoginAIR = false;

      // Переход в AIR

      await page.goto("https://myair-b2d.bmwgroup.com/air/faces/xhtml/Start.xhtml?guid=");
      await page.waitForNetworkIdle();

      isLoginPage = await page.$eval("title", (title) => title.textContent == "WEB-EAM Next");

      // Ввод VIN и переход на страницу автомобиля в AIR

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

    if (loginAIRTries == 3) {
      if (authMessage) {
        await fs.writeFile(__dirname + "/data/config.json", JSON.stringify({ aosStopped: true }, null, 2));
        console.log(`Ошибка при входе в AOS:\n\n${authMessage}\n\nПоиск в AOS для робота временно отключен.`);
        await telegram.notify(`*Ошибка при входе в AOS*:\n\n${authMessage}\n\nПоиск в AOS для робота временно отключен.`);
      }
      break;
    }
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

module.exports = getCarInfoFromSgateAir;
