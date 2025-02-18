const moment = require("moment");

const getWorkStatus = (value) => (value === "ВРаботе" && "В работе") || value;

exports.prepareWork = (workStatuses) => (item) => ({
  guid: item.Ref_Key,
  number: item.Number?.replace("НФФР-", ""),
  status: workStatuses.find((status) => status.Ref_Key === item.Состояние_Key)?.name,
  carGuid: item.Автомобиль_Key,
  date: moment(item.Date).utcOffset(180, true),
});
