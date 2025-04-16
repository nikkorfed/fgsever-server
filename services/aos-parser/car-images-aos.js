const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const getCarImagesFromCache = require("./car-images-cache");

const headless = process.env.HEADLESS === "true";

let getCarImagesFromAos = async (vin, hostname) => {
  if (!(vin.length == 7 || vin.length == 17)) return { error: "wrong-vin" };

  // Взятие изображений из кэша, если имеется
  let cache = await getCarImagesFromCache(vin, hostname);
  if (!cache.error) return cache;

  console.log(`[${vin}] Поиск изображений автомобиля...`);
  let isLoginPage = false;
  let tryLogin = false;

  const config = await fs
    .readFile(__dirname + "/data/config.json")
    .then(JSON.parse)
    .catch(() => null);
  if (config?.aosStopped) {
    console.log(`[${vin}] Поиск в AOS временно отключен!`);
    return { error: "images-not-found" };
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
      await page.goto("https://aos.bmwgroup.com/osmc/b2i/electronicPartsCatalog/start.html", { timeout: 10000 });
      await page.waitForNetworkIdle();
      await page.goto(await page.evaluate('document.getElementById("startlink").getAttribute("href")'), { timeout: 10000 });
      await page.waitForSelector('[perspectivextype="common-startseitePage"]', { timeout: 10000 });
      await page.click('[perspectivextype="common-startseitePage"]');

      console.log(`[${vin}] Переход в EPC выполнен`);
      tryLogin = false;
    } catch (error) {
      console.log(`[${vin}] В EPC что-то пошло не так :(`);
      console.log(error);
      isLoginPage = await page.$eval("title", (title) => title.textContent == "WEB-EAM Next").catch(() => false);
      tryLogin++;
    }

    if (tryLogin == 5) break;
  } while (tryLogin);

  // Переход на страницу автомобиля

  await page.type("#unspammableEnterListeningComboBox-1016-inputEl", vin);
  await page.click("#searchButton-1017-btnIconEl");
  await page.waitForNetworkIdle();

  // Поиск и сохранение изображений автомобиля

  const result = {};
  let tryImages = false;

  do {
    try {
      // Поиск адресов изображений

      console.log(`[${vin}] Поиск изображений...`);
      let links = {};

      const images = await page.$$(".x-img");
      links.exteriorImage = "https://etk-b2i.bmwgroup.com" + (await images[0].evaluate((image) => image.getAttribute("src")));
      links.interiorImage = "https://etk-b2i.bmwgroup.com" + (await images[1].evaluate((image) => image.getAttribute("src")));
      // await page.waitForFunction((image) => image.getAttribute("src").includes("/etk-rest/"), { polling: "mutation" }, images[0]);

      await images[0].click();
      await page.waitForSelector(".x-img.x-window-item", { timeout: 1500 });
      links.exteriorOriginalImage =
        "https://etk-b2i.bmwgroup.com" + (await page.$eval(".x-img.x-window-item", (image) => image.getAttribute("src")));

      let element = await page.$$(".x-tool-close");
      await element[1].click();

      await images[1].click();
      await page.waitForSelector(".x-img.x-window-item", { timeout: 1500 });
      links.interiorOriginalImage =
        "https://etk-b2i.bmwgroup.com" + (await page.$eval(".x-img.x-window-item", (image) => image.getAttribute("src")));

      // Сохранение изображений на сервер

      await fs.mkdir(__dirname + `/images/${vin}`, { recursive: true });

      let exteriorImageResponse = await page.goto(links["exteriorImage"]);
      let exteriorImagePath = `images/${vin}/exteriorImage.png`;
      await fs.writeFile(__dirname + "/" + exteriorImagePath, await exteriorImageResponse.buffer());

      let interiorImageResponse = await page.goto(links["interiorImage"]);
      let interiorImagePath = `images/${vin}/interiorImage.png`;
      await fs.writeFile(__dirname + "/" + interiorImagePath, await interiorImageResponse.buffer());

      let exteriorOriginalImageResponse = await page.goto(links["exteriorOriginalImage"]);
      let exteriorOriginalImagePath = `images/${vin}/exteriorOriginalImage.png`;
      await fs.writeFile(__dirname + "/" + exteriorOriginalImagePath, await exteriorOriginalImageResponse.buffer());

      let interiorOriginalImageResponse = await page.goto(links["interiorOriginalImage"]);
      let interiorOriginalImagePath = `images/${vin}/interiorOriginalImage.png`;
      await fs.writeFile(__dirname + "/" + interiorOriginalImagePath, await interiorOriginalImageResponse.buffer());

      // Формирование ссылок на изображения

      result.exteriorImage = `http://${hostname}/aos-parser/${exteriorImagePath}`;
      result.interiorImage = `http://${hostname}/aos-parser/${interiorImagePath}`;
      result.exteriorOriginalImage = `http://${hostname}/aos-parser/${exteriorOriginalImagePath}`;
      result.interiorOriginalImage = `http://${hostname}/aos-parser/${interiorOriginalImagePath}`;

      tryImages = false;
    } catch (error) {
      console.log(`[${vin}] При поиске и сохранении изображений что-то пошло не так :(`);
      console.log(error);
      tryImages++;
    }

    if (tryImages == 10) break;
  } while (tryImages);

  // Завершение работы браузера и возврат найденных данных

  await browser.close();
  if (Object.keys(result).length) {
    console.log(`[${vin}] Изображения автомобиля в EPC успешно найдены!`);
    return result;
  } else {
    console.log(`[${vin}] Изображения автомобиля найти не удалось!`);
    return { error: "images-not-found" };
  }
};

module.exports = getCarImagesFromAos;
