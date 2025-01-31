const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs").promises;
const telegram = require("~/utils/telegram");

const headless = process.env.HEADLESS === "true";

let getCarInfoFromAosEpc = async (vin) => {
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
  let isLoginPage = false;
  let authMessage = null;
  let tryLogin = false;

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
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "ru-RU" });
  page.on("dialog", async (dialog) => await dialog.dismiss());

  // Авторизация и переход в EPC

  do {
    try {
      // Авторизация в AOS

      if (tryLogin && isLoginPage) {
        console.log(`[${vin}] Оказались на странице входа. Заново авторизуемся...`);
        await page.type("input#idToken2", process.env.AOS_USER);
        await page.type("input#idToken3", process.env.AOS_PASSWORD);
        await page.click(`input[value="Войти в систему"]`);
        await page.waitForNetworkIdle();
        console.log(`[${vin}] Авторизация выполнена`);
      }

      // Сохранение/подключение куки

      if (tryLogin) {
        let cookies = JSON.stringify(await page.cookies(), null, 2);
        await fs.writeFile(__dirname + "/cookies/epc.cookies", cookies);
      } else {
        let cookies = JSON.parse(await fs.readFile(__dirname + "/cookies/epc.cookies").catch(() => null));
        if (cookies) await page.setCookie(...cookies);
      }

      // Переход в EPC

      console.log(`[${vin}] Переход в EPC...`);
      await page.goto("https://onl-osmc-b2i.bmwgroup.com/osmc/b2i/electronicPartsCatalog/start.html", { timeout: 10000 });
      await page.waitForNetworkIdle();
      await page.goto(await page.evaluate('document.getElementById("startlink").getAttribute("href")'), { timeout: 10000 });
      await page.waitForSelector('[perspectivextype="common-startseitePage"]', { timeout: 10000 });
      await page.click('[perspectivextype="common-startseitePage"]');

      console.log(`[${vin}] Переход в EPC выполнен`);
      tryLogin = false;
    } catch (err) {
      console.log(`[${vin}] В EPC что-то пошло не так :(`);
      console.log(`[${vin}]`, err);
      isLoginPage = await page.$eval("title", (title) => title.textContent == "WEB-EAM Next").catch(() => false);
      tryLogin++;

      if (tryLogin == 3) {
        if (authMessage) {
          await fs.writeFile(__dirname + "/data/config.json", JSON.stringify({ aosStopped: true }, null, 2));
          console.log(`Ошибка при входе в AOS:\n\n${authMessage}\n\nПоиск в AOS для робота временно отключен.`);
          await telegram.notify(`*Ошибка при входе в AOS*:\n\n${authMessage}\n\nПоиск в AOS для робота временно отключен.`);
        }
        break;
      }
    }
  } while (tryLogin);

  // Переход на страницу автомобиля

  await page.type("#unspammableEnterListeningComboBox-1016-inputEl", vin);
  await page.click("#searchButton-1017-btnIconEl");
  await page.waitForNetworkIdle();

  // Поиск информации

  const result = {};

  try {
    // Основная информация

    let foundVehicleText = await page.$eval(".etk-found-vehicle-text", (element) => element.textContent);
    let foundVehicleMatch = foundVehicleText.match(/(BMW \S+) ([EFG]\d\d) (.+) (\D\S{2,}) (\d\d\.\d\d\.\d\d\d\d)/);
    let [match, model, modelCode, description, motorCode, productionDate] = foundVehicleMatch;

    let fullVin = await page.$eval(
      "[id*=fahrzeugsuche-foundFahrzeugLabel][id*=innerCt] div:first-child [id*=label]:nth-child(2)",
      (element) => element.textContent.replace(/\s/g, "")
    );
    let image = await page.$eval(
      "[id*=fahrzeugsuche-fahrzeugCosyPanel][id*=targetEl] img:first-child",
      (element) => "https://etk-b2i.bmwgroup.com" + element.getAttribute("src")
    );
    (result.vin = fullVin), (result.model = model), (result.modelCode = modelCode), (result.description = description);
    (result.motorCode = motorCode), (result.productionDate = productionDate), (result.image = image);

    // Технические детали

    await page.click("[id*=fahrzeugDetails-fahrzeugDetailsWindow][id$=body] a.x-tab:nth-child(1)");
    result.details = await page.$$eval("[id*=fahrzeugsuche-fahrzeugangabenGrid][id$=body] table tr", (rows) =>
      rows.reduce((result, row) => {
        let name = row.querySelector("td:first-child").textContent;
        let value = row.querySelector("td:nth-child(2)").textContent;

        if (name == "Двери") result.doors = +value;
        if (name == "Двигатель") result.engine = value;
        if (name == "Объем двигателя") result.engineDisplacement = +value;
        if (name == "Мощность (кВт)") result.powerKW = +value;
        if (name == "Привод") result.drive = value;
        if (name == "Лаккр") result.color = value;
        if (name == "Обивка") result.upholstery = value;
        if (name == "Уровень интеграции (заводской)") result.factoryIntegrationLevel = value;
        if (name == "Уровень интеграции (текущий)") result.currentIntegrationLevel = value;
        if (name == "Индивидуальное оснащение") result.individualRetrofitting = value;

        return result;
      }, {})
    );

    // Количество жидкостей

    await page.click("[id*=fahrzeugDetails-fahrzeugDetailsWindow][id$=body] a.x-tab:nth-child(2)");
    result.quantities = await page.$$eval("[id*=fahrzeugsuche-fuellmengenGrid][id$=body] table tr", (rows) =>
      rows.reduce((result, row) => {
        let name = row.querySelector("td:first-child").textContent;
        let value = row.querySelector("td:nth-child(2)").textContent;

        if (name == "Охлаждение с кондиционированием воздуха") result.antifreezeWithAC = +value;
        if (name == "Охлаждение без кондиционирования воздуха") result.antifreezeWithoutAC = +value;
        if (name == "Задняя ось") result.rearAxleFinalDriveOil = +value;
        if (name.includes("Двигатель")) result.motorOil = +value;
        if (name.includes("КПП")) result.gearboxOil = +value;
        if (name.includes("Тормоз")) result.brakeFluid = +value;

        return result;
      }, {})
    );

    // Опции

    await page.click("[id*=fahrzeugDetails-fahrzeugDetailsWindow][id$=body] a.x-tab:nth-child(3)");
    result.options = await page.$$eval("[id*=fahrzeugsuche-ausstattungGrid][id$=body] table tr", (rows) => {
      const options = { factory: {}, installed: {} };
      return rows.reduce((result, row) => {
        let installed = row.classList.contains("etk-nachgeruestet");
        let code = row.querySelector("td:nth-child(2)")?.textContent;
        let name = row.querySelector("td:nth-child(3)")?.textContent;

        if (code && name) result[installed ? "installed" : "factory"][code] = name;
        return result;
      }, options);
    });

    let closeButton = await page.$('[data-qtip="Close dialog"]');
    await closeButton.click();
  } catch (error) {
    console.log(`[${vin}] При поиске информации произошла ошибка :(`);
    console.log(`[${vin}]`, error);
  }

  // Завершение работы браузера и возврат найденных данных

  await browser.close();
  if (Object.keys(result).length) {
    console.log(`[${vin}] Данные автомобиля в EPC успешно найдены!`);
    fs.writeFile(__dirname + `/cache/${vin}.json`, JSON.stringify(result));
    return result;
  } else {
    console.log(`[${vin}] Данные автомобиля найти не удалось!`);
    return { error: "car-info-not-found" };
  }
};

module.exports = getCarInfoFromAosEpc;
