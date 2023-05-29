const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs/promises");
const cheerio = require("cheerio");
const moment = require("moment");

const { prepareResult, catchError } = require("./utils");

const headless = process.env.HEADLESS === "true";
const login = "RIVERDALE@inbox.ru";
const password = "bmwsever72";

const browserRef = {};

let searchInArmtek = catchError(async (number, config = {}) => {
  config = {
    originalParts: config.originalParts ?? false,
    externalAnalogs: config.externalAnalogs ?? false,
    onlyFavorites: config.onlyFavorites ?? false,
    originalNumber: number,
  };

  // Запуск браузера
  const browser = await puppeteer.launch({ headless, defaultViewport: null, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const [page] = await browser.pages();
  browserRef.instance = browser;

  try {
    // Авторизация
    const cookies = JSON.parse(await fs.readFile(__dirname + "/cookies/armtek.json").catch(() => null));
    let tryLogin = false,
      loginTries = 0;

    do {
      loginTries++;
      if (!cookies || tryLogin) {
        if (page.url() !== "https://etp.armtek.ru/?redirect_url=/search") {
          await page.goto("https://etp.armtek.ru/search");
          await page.waitForNetworkIdle({ timeout: 10000 });
        }
        await page.evaluate(() => (document.getElementById("login").value = ""));
        await page.type("input#login", login);
        await page.evaluate(() => (document.getElementById("password").value = ""));
        await page.type("input#password", password);
        await page.evaluate(() => (document.getElementById("remember").checked = false));
        await page.click("form.sign-in-form .checkbox");
        await page.click("button#login-btn");
        await page.waitForNetworkIdle({ timeout: 11000 });

        const captcha = await page.$("#container-captcha");
        if (captcha) {
          // await page.waitForTimeout(15 * 1000);
          // await page.click("button#login-btn");
          // await page.waitForNetworkIdle({ timeout: 12000 });
          return {};
        }

        const cookies = await page.cookies();
        await fs.writeFile(__dirname + "/cookies/armtek.json", JSON.stringify(cookies, null, 2));
      } else {
        await page.setCookie(...cookies);
        await page.goto("https://etp.armtek.ru/search");
        await page.waitForNetworkIdle({ timeout: 13000 });
      }
      const signInForm = await page.$("form.sign-in-form");
      tryLogin = !!signInForm;
      if (loginTries == 3) break;
    } while (tryLogin);

    // Запрос информации об оригинальной запчасти
    await page.type("input#query-search", number);
    // await page.click("button#search-btn");
    await page.waitForSelector(".search-history-list .second_search", { timeout: 14000 });

    // Переход на страницу запчасти для BMW
    const originalPart = await page.evaluateHandle((number) => {
      const parts = Array.from(document.querySelectorAll(".search-history-list .second_search"));
      let isOriginal = (el) =>
        el.getAttribute("pin").replace(/\s/g, "") === number && el.querySelector(".brand-text").textContent === "BMW";
      return parts.find(isOriginal);
    }, number);
    await originalPart.click();
    await page.waitForSelector("#component-search-table-SRCDATA_wrapper", { timeout: 15000 });

    const content = await page.content();
    const $ = cheerio.load(content);

    // Оригинальные запчасти
    const originalPartsTitle = /Результаты поиска/;
    const originalPartsBlock = $(".section-result").filter((_, el) => $(el).text().match(originalPartsTitle));
    const originalParts = config.originalParts ? originalPartsBlock.nextUntil(".section-result").toArray() : [];

    // Аналоги c собственных складов
    const internalAnalogsTitle = /Возможные замены/;
    const internalAnalogsBlock = $(".section-result").filter((_, el) => $(el).text().match(internalAnalogsTitle));
    const isInternal = (_, el) =>
      $(el).find("td:nth-child(5) div").hasClass("search_sklad_now") || $(el).find("td:nth-child(5) div").hasClass("search_sklad_wait");
    const internalAnalogs = internalAnalogsBlock.nextAll("tr").filter(isInternal).toArray();

    // Аналоги у сторонних поставщиков
    const externalAnalogsTitle = /Возможные замены/;
    const externalAnalogsBlock = $(".section-result").filter((_, el) => $(el).text().match(externalAnalogsTitle));
    const isExternal = (_, el) => $(el).find("td:nth-child(5) div").hasClass("search_sklad_provider");
    const externalAnalogs = config.externalAnalogs ? externalAnalogsBlock.nextAll("tr").filter(isExternal).toArray() : [];

    // Подготовка запчастей
    const parts = [...originalParts, ...internalAnalogs, ...externalAnalogs];
    const result = prepareResult(parseParts(parts), config);

    return result;
  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
}, browserRef);

let parseParts = (parts) => {
  return parts.map((part) => {
    const $ = cheerio.load(part);

    let name = $("td.brandcell .brand-name").text();
    let description = $("td:nth-child(3) .name-text").text();
    let number = $("td.brandcell .pin-name").text();

    if (description.startsWith(number)) description = description.replace(number, "").trim();

    let price = +$("td.cell-price").text().replace(/\s/g, "");
    let shipping = parseDate($("td:nth-child(7) .date-delivery-container, td:nth-child(7) .delivery-count-day").text());

    return {
      name,
      description,
      number,
      price,
      shipping,
      from: "armtek",
    };
  });
};

let parseDate = (text) => {
  if (!text) return text;

  let days = text.match(/(\d+) дн./)?.[1];

  if (days) text = moment().add(days, "day").format("DD.MM");
  else text = moment(text, "DD.MM.YY").format("DD.MM");

  return text;
};

module.exports = searchInArmtek;
