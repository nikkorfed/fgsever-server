const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs/promises");
const cheerio = require("cheerio");

const { prepareResult, catchError } = require("./utils");

const headless = process.env.HEADLESS === "true";
const username = "+7(903)976-00-45";
const password = "comandG05";

const browserRef = {};

let searchInMajorAuto = catchError(async (numbers, config = {}) => {
  config.searchOriginals ??= numbers.split(",");

  // Запуск браузера
  const browser = await puppeteer.launch({ headless, defaultViewport: null, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const [page] = await browser.pages();
  browserRef.instance = browser;

  try {
    // Авторизация
    let tryLogin = false,
      loginTries = 0;
    do {
      loginTries++;
      const cookies = JSON.parse(await fs.readFile(__dirname + "/cookies/major-auto.json").catch(() => null));
      if (!cookies || tryLogin) {
        await page.goto("https://parts.major-auto.ru");
        await page.type("input#UserName", username);
        await page.type("input#Password", password);
        await page.click("input#btnLogOn");
        const cookies = await page.cookies();
        await fs.writeFile(__dirname + "/cookies/major-auto.json", JSON.stringify(cookies, null, 2));
      } else await page.setCookie(...cookies);
      await page.goto("https://parts.major-auto.ru/SearchNew");
      tryLogin = await page.$("input#btnLogOn");
      if (loginTries == 3) break;
    } while (tryLogin);

    // Запрос запчастей
    await page.click('a[data-searchtype="ByList"]');
    await page.type("textarea#searchElements", numbers.replace(/\,/g, "\n"));
    await page.click("input#SearchByList");
    await page.waitForSelector("#resultContainerByList");

    const content = await page.content();
    const $ = cheerio.load(content);

    // Оригинальные запчасти
    const originalParts = $("#resultContainerByList > table > tbody > tr").toArray();

    // Подготовка запчастей
    const parts = [...originalParts];
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

    let name = $("td:nth-child(2) .group-name").text();
    let description = $("td:nth-child(3)").text().replaceAll("/n", "").trim();
    let number = $("td:nth-child(2) .part-main").text().trim();

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

module.exports = searchInMajorAuto;
