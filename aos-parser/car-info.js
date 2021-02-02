const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs").promises;

let getCarInfo = async (vin) => {
  if (!(vin.length == 7 || vin.length == 17)) return { error: "wrong-vin" };

  console.log(`[${vin}] Поиск данных автомобиля...`);
  let result = {},
    isLoginPage = false,
    tryLoginAIR = false,
    loginAIRTries = 0;

  // Запуск браузера

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "ru-RU" });

  do {
    try {
      loginAIRTries++;

      // Авторизация в AOS

      if (tryLoginAIR && isLoginPage) {
        console.log(`[${vin}] Оказались на AOS Login. Заново авторизуемся...`);
        await page.goto("https://aos.bmwgroup.com/group/oss/start");
        await page.type("#USER", "komandir2c3@yandex.ru");
        await page.type("#PASSWORD", "comandG06");
        await page.click("#loginbtn");
        await page.waitForNavigation({ timeout: 10000 });
        console.log(`[${vin}] Авторизация выполнена`);
      }

      // Переход в AIR

      if (tryLoginAIR) {
        console.log(`[${vin}] Повторный переход в AIR...`);
        await page.goto("https://onl-osmc-b2i.bmwgroup.com/osmc/b2i/air/start.html?navigation=true&amp;langLong=ru-RU", { timeout: 10000 });
        isLoginPage = await page.$eval("title", (title) => title.textContent == "AOS Login");
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
      isLoginPage = await page.$eval("title", (title) => title.textContent == "AOS Login");
      await page.type(".air-vinsearch-field", vin);
      await page.click(".air-vinsearch-button");
      // await page.waitFor(500);

      if (await page.$(".air-vinsearch-feedback-vinnotfound")) {
        console.log(`[${vin}] Данный VIN не найден!`);
        await browser.close();
        return { error: "vin-not-found" };
      }

      if ((await page.$eval(".ui-datatable-tablewrapper tbody", (table) => table.textContent)) != "No records found.") {
        console.log(`[${vin}] По данному VIN найдено несколько автомобилей!`);
        let cars = await page.$$eval(".ui-datatable-tablewrapper tbody tr", (rows) =>
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

      await page.waitForSelector(".air-sonderausstattung", { timeout: 1500 });
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
    return result;
  } else {
    console.log(`[${vin}] Данные автомобиля найти не удалось!`);
    return { error: "car-info-not-found" };
  }
};

module.exports = getCarInfo;
