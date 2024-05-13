exports.prepareCar = (item) => ({
  guid: item.Ref_Key,
  vin: item.VIN,
  name: item.Description.split(" VIN ")[0]
    .replace("XDRIVE", "")
    .replace(/\s{2,}/, " ")
    .trim(),
});

exports.prepareCarPlate = (item) => ({
  guid: item.Автомобиль_Key,
  value: item.Значение,
});

exports.prepareCalendarEntry = (item) => ({
  guid: item.Ref_Key,
  name: item.Description,
  description: item.Описание,
});
