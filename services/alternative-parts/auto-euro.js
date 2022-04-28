const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs/promises");
const slugify = require("slugify");
const cheerio = require("cheerio");
const moment = require("moment");

require("moment/locale/ru");
moment.locale("ru");

const { filterParts } = require("./utils");

const headless = process.env.HEADLESS === "true";
const username = "riverdale";
const password = "riverdale";

let searchInAutoEuro = async (number, config = {}) => {
  config.externalAnalogs = config.externalAnalogs ?? true;
  config.onlyFavorites = config.onlyFavorites ?? false;

  // Запуск браузера
  const browser = await puppeteer.launch({ headless, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "ru-RU" });

  // Авторизация
  let tryLogin = false,
    loginTries = 0;
  do {
    loginTries++;
    const cookies = JSON.parse(await fs.readFile(__dirname + "/cookies/auto-euro.json").catch(() => null));
    if (!cookies || tryLogin) {
      await page.goto("https://shop.autoeuro.ru");
      await page.type("input#username", username);
      await page.type("input#password", password);
      await page.click("div#login");
      await page.waitForNavigation();
      const cookies = await page.cookies();
      await fs.writeFile(__dirname + "/cookies/auto-euro.json", JSON.stringify(cookies, null, 2));
    } else await page.setCookie(...cookies);
    await page.goto("https://shop.autoeuro.ru/main/search");
    const authTitle = await page.$eval("#authtitle", (element) => element.textContent);
    tryLogin = authTitle.includes("ВЫ НЕ АВТОРИЗОВАНЫ");
    if (loginTries == 3) break;
  } while (tryLogin);

  // Запрос информации об оригинальной запчасти
  await page.type("input#search_text_input2", number);
  await page.click("span#search_one_button");
  await page.waitForNavigation();

  // Переход на страницу запчасти для BMW
  const title = await page.$eval("h1", (element) => element.textContent);
  if (title.match(/уточнение производителя/i)) {
    const originalPart = await page.evaluateHandle(() => {
      const parts = Array.from(document.querySelectorAll("#variants .search_maker_block"));
      return parts.find((element) => element.querySelector("h1 .producer-info-link").textContent === "BMW");
    });
    const searchButton = await originalPart.$(".go_search");
    await searchButton.click();
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  }

  const content = await page.content();
  const $ = cheerio.load(content);
  await browser.close();

  // Аналоги c собственных складов
  const internalAnalogs = $(".proposals-2").toArray();

  // Аналоги у сторонних поставщиков
  const externalAnalogs = $(".proposals-3").toArray();

  // Подготовка запчастей
  const analogs = config.externalAnalogs ? [...internalAnalogs, ...externalAnalogs] : internalAnalogs;
  const result = filterParts(prepareParts(analogs), config);

  return result;
};

// Подготовка запчастей в подходящем формате
let prepareParts = (parts) => {
  const result = {};

  for (let part of parts) {
    const $ = cheerio.load(part);

    let name = $("h4 span").attr("data-maker_name");
    let description = $("h4 span").attr("data-name");
    let number = $("h4 span").attr("data-code");
    let key = slugify(name, { lower: true });

    let firstRow = $(".search_result_table .tb-best .row:first-child");
    let price = +firstRow.find("td:nth-child(6)").text().replace(/[\s₽]/g, "");
    let shipping = prepareDate(firstRow.find("td:nth-child(2) .custom-tooltip-informer").text());

    if (description?.match(/угол|углем/i)) {
      name += ", угольный";
    }

    if (result[key]) continue;

    result[key] = {
      name: name + shipping,
      description,
      number,
      price: price * 1.3,
      from: "auto-euro",
    };
  }

  return result;
};

let prepareDate = (text) => {
  text = text.replace(/[\s,]+/g, " ");
  text = text.slice(0, text.indexOf("до")).trim();

  if (text === "завтра") text = moment().add(1, "day").format("DD.MM");
  else text = moment(text, "D MMMM").format("DD.MM");

  return ` (Доставка ${text})`;
};

module.exports = searchInAutoEuro;
