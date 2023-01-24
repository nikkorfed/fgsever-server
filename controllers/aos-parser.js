const { getCarInfoFromSgate, getCarInfoFromCats, getCarInfoFromAir } = require("~/services/aos-parser");
const { getCarImagesFromSgate, getCarImagesFromCache } = require("~/services/aos-parser");

const port = +process.env.PORT;

exports.getCarInfo = async (req, res) => {
  const { vin, from } = req.query;
  let info;

  if (!vin) return res.send({ error: "no-vin" });

  if (!from || from === "cats") info = await getCarInfoFromSgate(vin); // Временное использвоание во всех случаях AOS
  // if (!from || from === "cats") info = await getCarInfoFromCats(vin);
  else if (from === "aos") info = await getCarInfoFromSgate(vin);
  else if (from === "air") info = await getCarInfoFromAir(vin);

  return res.send(info);
};

exports.getCarImages = async (req, res) => {
  const { vin } = req.query;

  let { hostname } = req;
  if (port !== 80) hostname += `:${port}`;

  if (!vin) return res.send({ error: "no-vin" });

  const images = await getCarImagesFromSgate(vin, hostname);
  return res.send(images);
};
