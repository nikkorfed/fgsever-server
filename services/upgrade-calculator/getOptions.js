const fs = require("fs/promises");
const moment = require("moment");
const { slugify } = require("transliteration");

const { GoogleSpreadsheet } = require("google-spreadsheet");
const doc = new GoogleSpreadsheet("1_9Dv5BNEkAx3e2c7bP58AhkctjyH9sMSR_8h8AGTnTY");

// (async () => {
//   const data = await getOptions({ modelCode: "G30", productionDate: "05.06.2019", currentOptions: [] });
//   await fs.writeFile("./result.json", JSON.stringify(data, null, 2));
//   console.log("\nФайл успешно сохранён!");
// })();

let getOptions = async ({ modelCode, productionDate, currentOptions = [] }) => {
  await doc.useServiceAccountAuth(require("./credentials.json"));
  await doc.loadInfo();

  let optionsSheet, specialPricesSheet;
  let options = { toCode, toName, parseDependencies, setPrice, addDependencies, addSpecialPrice, remove };
  currentOptions.hasOption = hasOption;

  // Определение необходимых листов для сбора данных
  for (let currentSheet of doc.sheetsByIndex)
    if (currentSheet.title.includes(modelCode))
      if (currentSheet.title.includes("опции")) {
        if (currentSheet.title.includes(">")) {
          let date = currentSheet.title.match(/> (\d+\.\d+)/)[1];
          if (+moment(productionDate, "DD-MM-YYYY") > +moment(date, ["MM-YYYY", "DD-MM-YYYY"])) optionsSheet = currentSheet;
        } else optionsSheet = currentSheet;
      } else if (currentSheet.title.includes("особые случаи")) {
        if (currentSheet.title.includes(">")) {
          let date = currentSheet.title.match(/> (\d+\.\d+)/)[1];
          if (+moment(productionDate, "DD-MM-YYYY") > +moment(date, ["MM-YYYY", "DD-MM-YYYY"])) specialPricesSheet = currentSheet;
        } else specialPricesSheet = currentSheet;
      }

  // Формирование списка опций
  for (let row of await optionsSheet.getRows()) {
    let option = {
      category: [translit(row["Категория"]), row["Категория"]],
      hidden: row["Скрыта"] == "Да" ? true : undefined,
      page: (row["Страница"] == "Есть" && true) || row["Страница"] || undefined,
      code: row["Код"],
      name: row["Название"],
      label: row["Примечание"] && row["Дополнительно"] ? [row["Примечание"], row["Дополнительно"]] : undefined,
      description: row["Описание"],
      price: row["Цена"] ? +row["Цена"].replace(/\s/g, "") : "",
    };

    if (row["Требует"]) option.required = row["Требует"].replace(/\s/g, "");
    if (row["Заменяет"]) option.contained = row["Заменяет"].replace(/\s/g, "");
    if (row["Включает"]) option.included = row["Включает"].replace(/\s/g, "");
    if (row["Рекомендует"]) option.recommended = row["Рекомендует"].replace(/\s/g, "");

    if (row["Виды опции"]) {
      let i = 1;
      option.types = {};
      for (let type of Array.from(row["Виды опции"].matchAll(/(.+) = ([\d ]+)/g)))
        option.types[i++] = { name: type[1], price: +type[2].replace(/\s/g, "") };
    }

    if (row["Части опции"]) {
      let i = 1;
      option.parts = {};
      for (let part of Array.from(row["Части опции"].matchAll(/(.+) = ([\d ]+)/g)))
        option.parts[i++] = { name: part[1], price: +part[2].replace(/\s/g, "") };
    }

    for (let property in option) if (!option[property] && property != "price") delete option[property];
    option = options[row["Кодовое имя"]] = option;
  }

  // Разбор зависимостей
  for (let option in options) {
    if (options[option].required) options[option].required = options.parseDependencies(options[option].required);
    if (options[option].contained) options[option].contained = options.parseDependencies(options[option].contained);
    if (options[option].included) options[option].included = options.parseDependencies(options[option].included);
    if (options[option].recommended) options[option].recommended = options.parseDependencies(options[option].recommended);
  }

  // Учёт особых условий
  for (let row of await specialPricesSheet.getRows()) {
    if (!row["Опция"]) continue;
    let targets = row["Опция"].replace(/\s/g, "").split(",");
    targets = targets.map((target) => options.toName(target));

    // console.log("\nПроверяем условие для опций", targets);

    let condition = row["Необходимые опции"].replace(/\s/g, "").split(",");
    if (!condition) condition = [];

    let neededOptions = condition.filter((option) => !option.includes("*"));
    let optionalOptions = condition.filter((option) => option.includes("*")).map((option) => options.toName(option.replace(/\*/g, "")));

    // console.log("Требуемые опции", neededOptions);
    // console.log("Опциональные опции", optionalOptions);

    let fulfilled = neededOptions.every((option) => {
      if (option.includes("/")) return option.split("/").some((option) => currentOptions.hasOption(options.toCode(option)));
      else if (option.includes("!")) return !currentOptions.hasOption(options.toCode(option.slice(1)));
      else return currentOptions.hasOption(options.toCode(option));
    });

    // console.log("Условие по требуемым опциям выполнено?", fulfilled);

    // if (row["Код кузова"] && !row["Код кузова"].includes(modelCode)) fulfilled = false;
    if (row["Код кузова"]) {
      let codes = row["Код кузова"].replace(/\s/g, "").split("/");
      if (codes.every((item) => modelCode != item)) fulfilled = false;
    }

    if (row["Дата выпуска"]) {
      let dateCondition = row["Дата выпуска"].replace(/\s/g, "").split(",");
      fulfilled = dateCondition.every((date) => {
        if (date.includes(">") && +moment(productionDate, "DD-MM-YYYY") > +moment(date, ["MM-YYYY", "DD-MM-YYYY"])) return true;
        if (date.includes("<") && +moment(productionDate, "DD-MM-YYYY") < +moment(date, ["MM-YYYY", "DD-MM-YYYY"])) return true;
      });
    }

    // console.log("Полное условие выполнено?", fulfilled);
    if (!fulfilled) continue;

    for (let target of targets) {
      if (!optionalOptions.length) {
        // console.log("Устанавливаем постоянную цену для опции", target);
        if (row["Цена"]) options.setPrice(target, row["Цена"]);
        if (row["Требует"]) options.addDependencies(target, "required", row["Требует"]);
        if (row["Заменяет"]) options.addDependencies(target, "contained", row["Заменяет"]);
        if (row["Включает"]) options.addDependencies(target, "included", row["Включает"]);
        if (row["Рекомендует"]) options.addDependencies(target, "recommended", row["Рекомендует"]);
        if (row["Примечание"] && row["Дополнительно"]) options[target].label = [row["Примечание"], row["Дополнительно"]];
      }

      if (optionalOptions.length) {
        // console.log("Устаналиваем специальную цену для опции", target);
        options.addSpecialPrice(target, optionalOptions, row["Цена"]);
        // if (!options[target].specialPrices) options[target].specialPrices = [];
        // options[target].specialPrices.push({ condition: optionalOptions, price: row["Цена"].replace(/\s/g, "") });
      }
    }
  }

  // Удаление имеющихся в автомобиле опций
  for (let option in options) if (currentOptions.hasOption(options.toCode(option))) options.remove(option);

  return options;
};

// Транслит названия опций
function translit(input) {
  return slugify(input, { replace: [[/\./, "-"]] });
}

// Перевод кода опции в название
function toName(option) {
  if (option.includes(".")) {
    let [optionName, detail] = option.split(".");
    if (!this[optionName]) for (let item in this) if (this[item].code == optionName) return `${item}.${detail}`;
  }

  if (!this[option]) for (let item in this) if (this[item].code == option) return item;
  return option;
}

// Перевод названия опции в код
function toCode(option) {
  if (this[option]) return this[option].code;
  return option;
}

// Перевод зависимостей опций из текста в массив
function parseDependencies(input) {
  let dependencies = [];

  for (let option of input.match(/[\w\/\.\-]+/g))
    if (option.includes("/")) dependencies.push(option.split("/").map((option) => this.toName(option)));
    else dependencies.push(this.toName(option));

  return dependencies;
}

// Проверка на наличие опции в автомобиле
function hasOption(code) {
  return this.some((option) => option.includes(code));
}

// Установка цены для опции или её части/вида
function setPrice(target, price) {
  // console.log("Установка цена для", target);
  price = price.replace(/\s/g, "");

  if (target.includes(".")) {
    let [option, detail] = target.split(".");
    if (!this[option]) return;
    // console.log(option, detail);
    if (this[option].parts && this[option].parts[detail]) {
      // console.log(`Устанавливаем цену части ${detail} опции ${option}`);
      if (price.includes("+")) this[option].parts[detail].price += +price.slice(0, -1);
      else if (price.includes("-")) this[option].parts[detail].price -= +price.slice(0, -1);
      else if (price.includes("x") || price.includes("х")) delete this[option].parts[detail];
      else if (price == "Показать") delete this[option].hidden;
      else this[option].parts[detail].price = +price;
    } else if (this[option].types && this[option].types[detail]) {
      // console.log(`Устанавливаем цену вида ${detail} опции ${option}`);
      if (price.includes("+")) this[option].types[detail].price += +price.slice(0, -1);
      else if (price.includes("-")) this[option].types[detail].price -= +price.slice(0, -1);
      else if (price.includes("x") || price.includes("х")) delete this[option].types[detail];
      else if (price == "Показать") delete this[option].hidden;
      else this[option].types[detail].price = +price;
    }
    return;
  }

  if (!this[target]) return;
  if (price.includes("+")) this[target].price += +price.slice(0, -1);
  else if (price.includes("-")) this[target].price -= +price.slice(0, -1);
  else if (price.includes("x") || price.includes("х")) this.remove(target);
  else if (price == "Скрыть") this.remove(target, true);
  else if (price == "Показать") delete this[target].hidden;
  else this[target].price = +price;
}

// Добавление новых зависимостей
function addDependencies(target, dependencies, data) {
  if (target.includes(".") || !this[target]) return;
  data = data.replace(/\s/g, "").split(",");

  for (let option of data) {
    if (!this[target][dependencies]) this[target][dependencies] = [];
    if (option.includes("/")) this[target][dependencies].push(option.split("/").map((option) => this.toName(option)));
    else if (option.includes("x") || option.includes("х")) delete this[target][dependencies];
    else this[target][dependencies].push(this.toName(option));
  }
}

// Добавление специальной цены для опции или её части/вида
function addSpecialPrice(target, condition, price) {
  // console.log("Добавляем специальную цену для", target);
  price = +price.replace(/\s/g, "");

  if (target.includes(".")) {
    let [optionName, detail] = target.split(".");
    if (!this[optionName]) return;

    if (this[optionName].parts && this[optionName].parts[detail]) {
      if (!this[optionName].parts[detail].specialPrices) this[optionName].parts[detail].specialPrices = [];
      this[optionName].parts[detail].specialPrices.push({ condition, price });
    } else if (this[optionName].types && this[optionName].types[detail]) {
      if (!this[optionName].types[detail].specialPrices) this[optionName].types[detail].specialPrices = [];
      this[optionName].parts[detail].specialPrices.push({ condition, price });
    }
    return;
  }

  if (!this[target]) return;
  if (!this[target].specialPrices) this[target].specialPrices = [];
  if (price == 0) price = "Входит в комплект";
  this[target].specialPrices.push({ condition, price });
}

// Удаление опции и связанных с ней других опций
function remove(option, shallow) {
  // console.log("Удаляем опцию", option);
  const removeName = this.toName(option);
  const removeOption = this[removeName];
  if (!removeOption) return;

  if (!shallow) {
    // Удаление требуемых для неё опций
    if (removeOption.required) for (let required of removeOption.required) if (typeof required != "object") this.remove(required);

    // Удаление содержащихся в ней опций
    if (removeOption.contained) for (let contained of removeOption.contained) this.remove(contained, true);

    // Удаление включённых в неё опций
    if (removeOption.included) for (let included of removeOption.included) this.remove(included);
  }

  // Удаление требований этой опции в других
  for (let option in this) {
    if (!this[option].required) continue;

    // Удаляем отдельное требование опции
    this[option].required = this[option].required.filter((option) => option != removeName);

    // Удаляем требование опции в качестве одной из нескольких
    this[option].required.forEach((required, index) => {
      if (typeof required == "object" && required.includes(removeName)) {
        this[option].required.splice(index, 1);
        // required = required.filter((option) => option != removeName);
        // if (required.length == 1) required = required[0];
        // this[option].required[index] = required;
      }
    });

    // Удаляем требуемые опции, если ничего не осталось
    this[option].required == this[option].required.filter((required) => (Array.isArray(required) ? required.length : true));
    if (!this[option].required.length) delete this[option].required;
  }

  // Удаление включенной этой опции в других
  for (let option in this) {
    if (!this[option].included) continue;
    this[option].included = this[option].included.filter((included) => included != removeName);
    if (!this[option].included.length) delete this[option].included;
  }

  // Удаление рекомендаций этой опции в других
  for (let option in this) {
    if (!this[option].recommended) continue;
    this[option].recommended.forEach((recommended, index) => {
      if (typeof recommended == "object") {
        if (recommended.find((option) => option == removeName)) this[option].recommended.splice(index, 1);
      } else if (recommended == removeName) this[option].recommended.splice(index, 1);
    });
    if (!this[option].recommended.length) delete this[option].recommended;
  }

  // Удаление самой исходной опции
  delete this[removeName];
}

module.exports = getOptions;
