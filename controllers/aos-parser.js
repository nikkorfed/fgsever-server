const { getCarInfoFromCats, getCarInfoFromAir, getCarInfoFromAosEpc } = require("~/services/aos-parser");
const { getCarImagesFromAos, getCarImagesFromCache } = require("~/services/aos-parser");

const port = +process.env.PORT;

exports.getCarInfo = async (req, res) => {
  let { vin, from } = req.query;
  let { hostname } = req;
  if (port !== 80) hostname += `:${port}`;

  if (!vin) return res.send({ error: "no-vin" });

  let info;
  if (!from) info = await getCarInfoFromAosEpc(vin, hostname);
  else if (from === "cats") info = await getCarInfoFromCats(vin);
  else if (from === "aos") info = await getCarInfoFromAosEpc(vin, hostname);
  else if (from === "air") info = await getCarInfoFromAir(vin);

  return res.send(info);
};

exports.getCarImages = async (req, res) => {
  let { vin } = req.query;
  let { hostname } = req;
  if (port !== 80) hostname += `:${port}`;

  if (!vin) return res.send({ error: "no-vin" });

  const images = await getCarImagesFromAos(vin, hostname);
  return res.send(images);
};
