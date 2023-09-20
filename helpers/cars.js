exports.prepareCar = (item) => ({
  guid: item.Ref_Key,
  vin: item.VIN,
  name: item.Description.split(" VIN ")[0]
    .replace("XDRIVE", "")
    .replace(/\s{2,}/, " ")
    .trim(),
});
