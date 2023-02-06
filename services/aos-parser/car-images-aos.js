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
  let result = {},
    isLoginPage = false,
    tryLoginETK = false,
    loginETKTries = 0;

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
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "ru-RU" });
  page.on("dialog", async (dialog) => await dialog.dismiss());

  // Поиск данных в ETK

  do {
    try {
      loginETKTries++;

      // Авторизация в AOS

      if (tryLoginETK && isLoginPage) {
        console.log(`[${vin}] Оказались на AOS Login. Заново авторизуемся...`);
        await page.goto("https://aos.bmwgroup.com/group/oss/start");
        await page.waitForNetworkIdle();
        await page.type("#USER", process.env.AOS_USER);
        await page.type("#PASSWORD", process.env.AOS_PASSWORD);
        await page.click("#loginbtn");
        await page.waitForNetworkIdle();
        console.log(`[${vin}] Авторизация выполнена`);
      }

      // Переход в ETK

      if (tryLoginETK) {
        console.log(`[${vin}] Повторный переход в ETK`);
        await page.goto("https://onl-osmc-b2i.bmwgroup.com/osmc/b2i/electronicPartsCatalog/start.html?navigation=true&langLong=ru-RU");
        isLoginPage = await page.$eval("title", (element) => element.textContent == "AOS Login");
        await page.goto(await page.evaluate('document.getElementById("startlink").getAttribute("href")'));
        let cookies = JSON.stringify(await page.cookies(), null, 2);
        await fs.writeFile(__dirname + "/cookies/etk.cookies", cookies);
        console.log(`[${vin}] Переход в ETK выполнен`);
      }

      // Переход на страницу автомобиля в ETK

      if (!tryLoginETK) {
        let cookies = await fs.readFile(__dirname + "/cookies/etk.cookies");
        cookies = JSON.parse(await cookies);
        await page.setCookie(...cookies);
        await page.goto("https://etk-b2i.bmwgroup.com?sessionId=679c48cb722c46138aed7376a48101d3&amp;portal=OSMC&amp;lang=ru_RU");
      } else tryLoginETK = false;
      isLoginPage = await page.$eval("title", (title) => title.textContent == "AOS Login");
      // await page.waitFor(1500);
      await page.waitForSelector('[perspectivextype="common-startseitePage"]', { timeout: 1500 });
      await page.click('[perspectivextype="common-startseitePage"]');
      await page.type("#unspammableEnterListeningComboBox-1016-inputEl", vin);
      await page.click("#searchButton-1017-btnIconEl");
      let showInfoFailed = false;
      do {
        try {
          await page.click('[data-qtip="Отобразить информацию о транспортном средстве"]');
          showInfoFailed = false;
        } catch {
          showInfoFailed = true;
        }
      } while (showInfoFailed);
      await page.waitForSelector(".x-img", { timeout: 1500 });

      // Поиск и сохранение изображений автомобиля

      let tryImages = false,
        imagesTries = 0;

      do {
        try {
          imagesTries++;

          if (tryImages) console.log(`[${vin}] Повторный поиск изображений...`);

          // Поиск адресов изображений

          let links = {};

          const images = await page.$$(".x-img");
          links["exteriorImage"] = "https://etk-b2i.bmwgroup.com" + (await images[0].evaluate((image) => image.getAttribute("src")));
          links["interiorImage"] = "https://etk-b2i.bmwgroup.com" + (await images[1].evaluate((image) => image.getAttribute("src")));
          // await page.waitForFunction((image) => image.getAttribute("src").includes("/etk-rest/"), { polling: "mutation" }, images[0]);

          await images[0].click();
          await page.waitForSelector(".x-img.x-window-item", { timeout: 1500 });
          links["exteriorOriginalImage"] =
            "https://etk-b2i.bmwgroup.com" + (await page.$eval(".x-img.x-window-item", (image) => image.getAttribute("src")));

          let element = await page.$$(".x-tool-close");
          await element[1].click();

          await images[1].click();
          await page.waitForSelector(".x-img.x-window-item", { timeout: 1500 });
          links["interiorOriginalImage"] =
            "https://etk-b2i.bmwgroup.com" + (await page.$eval(".x-img.x-window-item", (image) => image.getAttribute("src")));

          // Сохранение изображений на сервер

          await fs.mkdir(`images/${vin}`, { recursive: true }, (error) => {
            throw error;
          });
          let exteriorImage = await page.goto(links["exteriorImage"]);
          await fs.writeFile(`images/${vin}/exteriorImage.png`, await exteriorImage.buffer(), (error) => {
            throw error;
          });
          let interiorImage = await page.goto(links["interiorImage"]);
          await fs.writeFile(`images/${vin}/interiorImage.png`, await interiorImage.buffer(), (error) => {
            throw error;
          });
          let exteriorOriginalImage = await page.goto(links["exteriorOriginalImage"]);
          await fs.writeFile(`images/${vin}/exteriorOriginalImage.png`, await exteriorOriginalImage.buffer(), (error) => {
            throw error;
          });
          let interiorOriginalImage = await page.goto(links["interiorOriginalImage"]);
          await fs.writeFile(`images/${vin}/interiorOriginalImage.png`, await interiorOriginalImage.buffer(), (error) => {
            throw error;
          });

          // Формирование ссылок к изображениям
          result["exteriorImage"] = `http://${hostname}/aos-parser/images/${vin}/exteriorImage.png`;
          result["interiorImage"] = `http://${hostname}/aos-parser/images/${vin}/interiorImage.png`;
          result["exteriorOriginalImage"] = `http://${hostname}/aos-parser/images/${vin}/exteriorOriginalImage.png`;
          result["interiorOriginalImage"] = `http://${hostname}/aos-parser/images/${vin}/interiorOriginalImage.png`;

          tryImages = false;
        } catch (error) {
          console.log(`[${vin}] При поиске и сохранении изображений что-то пошло не так :(`);
          // console.log(error);
          tryImages = true;
        }

        if (imagesTries == 10) break;
      } while (tryImages);
    } catch (error) {
      console.log(`[${vin}] В ETK что-то пошло не так :(`);
      // console.log(error);
      tryLoginETK = true;
    }

    if (loginETKTries == 5) break;
  } while (tryLoginETK);

  // Завершение работы браузера и возврат найденных данных

  await browser.close();
  if (Object.keys(result).length) {
    console.log(`[${vin}] Изображения автомобиля в ETK успешно найдены!`);
    return result;
  } else {
    console.log(`[${vin}] Изображения автомобиля найти не удалось!`);
    return { error: "images-not-found" };
  }
};

module.exports = getCarImagesFromAos;
