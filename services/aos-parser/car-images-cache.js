const fs = require("fs").promises;

let getCarImagesFromCache = async (vin, hostname) => {
  if (!(vin.length == 7 || vin.length == 17)) return { error: "wrong-vin" };

  let exists = await fs
    .access(__dirname + `/images/${vin}/exteriorImage.png`)
    .then((result) => true)
    .catch((error) => false);

  if (!exists) {
    console.log(`[${vin}] Изображения автомобиля в кэше найти не удалось!`);
    return { error: "images-not-found" };
  }

  let result = {
    exteriorImage: `http://${hostname}/aos-parser/images/${vin}/exteriorImage.png`,
    interiorImage: `http://${hostname}/aos-parser/images/${vin}/interiorImage.png`,
    exteriorOriginalImage: `http://${hostname}/aos-parser/images/${vin}/exteriorOriginalImage.png`,
    interiorOriginalImage: `http://${hostname}/aos-parser/images/${vin}/interiorOriginalImage.png`,
  };

  console.log(`[${vin}] Изображения автомобиля в кэше успешно найдены!`);
  return result;
};

module.exports = getCarImagesFromCache;
