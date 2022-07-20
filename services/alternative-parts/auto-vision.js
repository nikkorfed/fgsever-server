const { default: axios } = require("axios");
const { XMLParser } = require("fast-xml-parser");
const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs/promises");
const cheerio = require("cheerio");
const moment = require("moment");

require("moment/locale/ru");
moment.locale("ru");

const { catchError, prepareResult } = require("./utils");

const headless = process.env.HEADLESS === "true";
const login = "bmw2";
const password = "lenovo";

let searchInAutoVision = catchError(async (number, config = {}) => {
  config = { originalNumber: number, skipNotAvailable: true };

  // Запуск браузера
  const browser = await puppeteer.launch({ headless, defaultViewport: null, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const [page] = await browser.pages();

  // Авторизация
  let tryLogin = false,
    loginTries = 0;
  do {
    loginTries++;
    const cookies = JSON.parse(await fs.readFile(__dirname + "/cookies/auto-vision.json").catch(() => null));
    if (!cookies || tryLogin) {
      await page.goto("http://am1.auto-vision.ru");
      await page.type("input#userlogin", login);
      await page.type("input#userpassword", password);
      await page.click("input#cb1");
      await page.click("input.submitButton");
      await page.waitForNavigation();
      const cookies = await page.cookies();
      await fs.writeFile(__dirname + "/cookies/auto-vision.json", JSON.stringify(cookies, null, 2));
    } else {
      await page.setCookie(...cookies);
      await page.goto("http://am1.auto-vision.ru");
    }
    const loginBlock = await page.$("form#login");
    tryLogin = loginBlock;
    if (loginTries == 3) break;
  } while (tryLogin);

  // Запрос информации об оригинальной запчасти
  await page.type("#search_input input", number);
  await page.click("#search_buttons input");
  await page.waitForSelector("#main_inner_wrapper h1");

  const content = await page.content();
  const $ = cheerio.load(content);
  await browser.close();

  // Деталь не найдена
  const message = $("#main_inner_wrapper ul").text().trim().replace(/\s+/g, " ");
  if (message?.includes("Unfortunately, this spare part or its substitutes were not found in the supplies.")) return {};

  // Курс евро
  const response = await axios.get("http://www.cbr.ru/scripts/XML_daily.asp");
  const parser = new XMLParser();
  const currencies = parser.parse(response.data);
  const euroRate = +currencies.ValCurs.Valute.find((Valute) => Valute.CharCode === "EUR").Value.replace(",", ".");

  // Оригинальная запчасть
  const part = {
    name: $("tr.new_article .brand").text().trim(),
    description: $("tr.new_article .leftside span").get(2).textContent?.trim(),
    number: $("tr.new_article .article").text().trim(),
    price:
      $("tr.group1 .col_final_price")
        .text()
        .match(/\d+(?:\.\d+)?/) * euroRate,
    // shipping: moment().add($("tr.group1 .col_term").text().replace(/\s/g, "").split("/")[0], "day").format("DD.MM"),
    shipping: moment().add(2, "month").format("DD.MM"),
    available: $("tr.group1 .col_remains img[title=present]").length > 0,
    from: "auto-vision",
  };

  // Подготовка запчастей
  const result = prepareResult([part], config);
  return result;
});

module.exports = searchInAutoVision;
