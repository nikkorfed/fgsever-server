const { getCarInfoFromAos, getCarInfoFromCats, getCarInfoFromAir } = require("../services/aos-parser");
const { getCarImagesFromAos, getCarImagesFromCache } = require("../services/aos-parser");

exports.getCarInfo = async (req, res) => {
  const { vin, from } = req.query;
  let info;

  if (!vin) return res.send({ error: "no-vin" });

  if (!from || from === "cats") info = await getCarInfoFromCats(vin);
  else if (from === "aos") info = await getCarInfoFromAos(vin);
  else if (from === "air") info = await getCarInfoFromAir(vin);

  return res.send(info);
};

exports.getCarImages = async (req, res) => {
  const { vin } = req.query;

  if (!vin) return res.send({ error: "no-vin" });

  const images = await getCarImagesFromCache(vin, req.hostname);
  return res.send(images);
};
