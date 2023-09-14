const moment = require("moment");

exports.prepareWork = (item) => ({
  guid: item.Ref_Key,
  date: moment(item.Date).utcOffset(180, true),
});
