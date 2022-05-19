const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs/promises");
const cheerio = require("cheerio");
const moment = require("moment");

require("moment/locale/ru");
moment.locale("ru");

const { prepareResult } = require("./utils");

const headless = process.env.HEADLESS === "true";
const username = "riverdale";
const password = "riverdale";

let searchInAutoEuro = async (number, config = {}) => {
  config.originalParts = config.originalParts ?? true;
  config.externalAnalogs = config.externalAnalogs ?? true;
  config.onlyFavorites = config.onlyFavorites ?? false;
  config.originalNumber = number;

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
    await page.waitForSelector("#variants");
  }

  const content = await page.content();
  const $ = cheerio.load(content);
  await browser.close();

  // Оригинальные запчасти
  const originalPartsTitle = /Предложения запрошенного товара/;
  const originalPartsElements = $(".proposal_group_name").filter((_, el) => $(el).text().replace(/\s+/g, " ").match(originalPartsTitle));
  const originalParts = config.originalParts ? originalPartsElements.siblings(".search_maker_block").toArray() : [];

  // Аналоги c собственных складов
  const internalAnalogsTitle = /Аналоги\/кроссы в наличии на складе/;
  const internalAnalogsBlock = $(".proposal_group_name").filter((_, el) => $(el).text().replace(/\s+/g, " ").match(internalAnalogsTitle));
  const internalAnalogs = internalAnalogsBlock.siblings(".search_maker_block").toArray();

  // Аналоги у сторонних поставщиков
  const externalAnalogsTitle = /Аналоги\/кроссы \(\d+\)/;
  const externalAnalogsBlock = $(".proposal_group_name").filter((_, el) => $(el).text().replace(/\s+/g, " ").match(externalAnalogsTitle));
  const externalAnalogs = config.externalAnalogs ? externalAnalogsBlock.siblings(".search_maker_block").toArray() : [];

  // Подготовка запчастей
  const parts = [...originalParts, ...internalAnalogs, ...externalAnalogs];
  const result = prepareResult(parseParts(parts), config);

  return result;
};

let parseParts = (parts) => {
  return parts.map((part) => {
    const $ = cheerio.load(part);

    let name = $("h4 span").attr("data-maker_name");
    let description = $("h4 span").attr("data-name");
    let number = $("h4 span").attr("data-code");

    let bestAvailableRow = $(".search_result_table .tb-best .highlight-green").first();
    let bestRow = $(".search_result_table .tb-best .row").first();
    let priceRow = bestAvailableRow.length ? bestAvailableRow : bestRow;
    let price = +priceRow.find("td:nth-child(6)").text().replace(/[\s₽]/g, "");
    let shipping = prepareDate(priceRow.find("td:nth-child(2) .custom-tooltip-informer").text());

    return {
      name,
      description,
      number,
      price,
      shipping,
      from: "auto-euro",
    };
  });
};

let prepareDate = (text) => {
  if (!text) return text;

  text = text.replace(/[\s,]+/g, " ");
  text = text.slice(0, text.indexOf("до")).trim();

  if (text === "завтра") text = moment().add(1, "day").format("DD.MM");
  else text = moment(text, "D MMMM").format("DD.MM");

  return text;
};

module.exports = searchInAutoEuro;
