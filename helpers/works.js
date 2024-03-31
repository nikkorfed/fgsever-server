const moment = require("moment");

const getWorkStatus = (value) => (value === "ВРаботе" && "В работе") || value;

exports.prepareWork = (item) => ({
  guid: item.Ref_Key,
  number: item.Number?.replace("НФФР-", ""),
  status: getWorkStatus(item.Состояние),
  carGuid: item.Автомобиль_Key,
  date: moment(item.Date).utcOffset(180, true),
});
