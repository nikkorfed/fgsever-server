const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs/promises");
const cheerio = require("cheerio");
const axios = require("axios").default;

const { prepareResult, catchError } = require("./utils");

const headless = process.env.HEADLESS === "true";
const username = "Дерюгин ПС";
const password = "3306";

let searchInRolf = catchError(async (numbers, config = {}) => {
  config.searchOriginals ??= numbers.split(",");

  // Запуск браузера
  const browser = await puppeteer.launch({ headless, defaultViewport: null, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const [page] = await browser.pages();

  try {
    // Авторизация
    let tryLogin = false,
      loginTries = 0;
    do {
      loginTries++;
      const cookies = JSON.parse(await fs.readFile(__dirname + "/cookies/rolf.json").catch(() => null));
      if (!cookies || tryLogin) {
        await page.goto("http://sprolf.ru");
        await page.type("input[name=username]", username);
        await page.type("input[name=password]", password);
        await page.click("input[name=cmdweblogin]");
        const cookies = await page.cookies();
        await fs.writeFile(__dirname + "/cookies/rolf.json", JSON.stringify(cookies, null, 2));
      } else await page.setCookie(...cookies);
      await page.goto("http://sprolf.ru/index.php?id=137");
      tryLogin = await page.$("input[name=cmdweblogin]");
      if (loginTries == 3) break;
    } while (tryLogin);

    // Запрос запчастей
    await page.type("textarea[name=articles]", numbers);
    await page.click(".search-list input[name=search]");
    await page.waitForNetworkIdle();
    await page.$("table#multisearch");

    const content = await page.content();
    const $ = cheerio.load(content);

    // Оригинальные запчасти
    const originalParts = $("#multisearch tr.event, #multisearch tr.event1").toArray();

    // Подготовка запчастей
    const parts = [...originalParts];
    const result = prepareResult(parseParts(parts), config);

    return result;
  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
});

let parseParts = (parts) => {
  return parts.map((part) => {
    const $ = cheerio.load(part);

    let name = $("td:nth-child(4)").text();
    let description = $("td:nth-child(6)").text();
    let number = $("td:nth-child(2)").text();

    let price = $("td:nth-child(7)").text();
    // let shipping = $("td:nth-child(9)").text();
    let available = $("td:nth-child(8)").text().replace(/\D/g, "") > 0;

    return {
      name,
      description,
      number,
      price,
      // shipping,
      available,
      from: "rolf",
    };
  });
};

module.exports = searchInRolf;
