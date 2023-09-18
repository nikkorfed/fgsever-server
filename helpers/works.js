const moment = require("moment");

exports.prepareWork = (item) => ({
  guid: item.Ref_Key,
  number: item.Number?.replace("НФФР-", ""),
  date: moment(item.Date).utcOffset(180, true),
});
