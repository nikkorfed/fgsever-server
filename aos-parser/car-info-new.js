const axios = require("axios");
const fs = require("fs/promises");

let getCarInfo = async (vin) => {
  if (!(vin.length == 7 || vin.length == 17)) return { error: "wrong-vin" };
  let result = {};

  if (await fs.access(`./cache/${vin}.json`)) {
    console.log(`[${vin}] Данные автомобиля найдены взяты из кэша!`);
    return JSON.parse(await fs.readFile(`./cache/${vin}.json`));
  }

  console.log(`[${vin}] Поиск данных автомобиля...`);
  const response = await axios.get(`http://93.94.150.149:65432/${vin}`);

  result.image;
  result.vin = response.match(/VIN \(17-значный\) ([\w\d]{17})/)[1];
  result.model = response.match(/Модель ([\d\w\s]+)/)[1].trim();
  result.modelCode = response.match(/Внутризаводское обозначение серии ([\d\w]+)/)[1].trim();
  result.productionDatte = response.match(/Дата изготовления (\d{2}\.\d{2}\.\d{4})/)[1].trim();

  let options = response.match(/Дополнительное оборудование с завода: Установленное позже дополнительное оборудование: (.+) Версия/)[1];
  options = options.replace(" На этом транспортном средстве не проводилось дооснащение.", "");
  let indexes = Array.from(options.matchAll(/\s0[\d\w]{3}|\sA[\d]{3}/g)).map((match) => match.index);
  indexes.push(options.length);

  options = indexes.reduce((array, start, index) => {
    array.push(options.slice(indexes[index - 1] + 1, start));
    return array;
  }, []);

  let installedIndex = options.findIndex((option) => option[0] == "A");
  let factory = options.slice(0, installedIndex + 1);
  let installed = options.slice(installedIndex + 1, options.length);

  result.options = { factory, installed };
  console.log(`[${vin}] Данные автомобиля в AIR успешно найдены!`);

  if (!fs.access("./cache")) await fs.mkdir("./cache");
  fs.writeFile(`./cache/${vin}.json`, JSON.stringify(result));
  return result;
};

module.exports = getCarInfo;
