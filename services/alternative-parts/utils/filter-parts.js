const _ = require("lodash");

let filterParts = (parts, config) => {
  markFavorites(parts);

  if (config.onlyFavorites) {
    const [favoriteAnalogs] = _.partition(parts, (part) => part.favorite);
    parts = favoriteAnalogs;
  }

  return parts;
};

let markFavorites = (parts) => {
  for (const key in parts) {
    let { name, description } = parts[key];
    if (
      (description.match(/фильтр воздушный|фильтр салона/i) && name.match(/KNECHT|MANN|MANN-FILTER|BOSCH|CORTECO|MAHLE/i)) ||
      (description.match(/фильтр/i) && name.match(/KNECHT|MANN|MAHLE/i)) ||
      (description.match(/свеча/i) && name.match(/CHAMPION|BOSCH|NGK/i)) ||
      (description.match(/тормоз|датчик|диск|disc/i) && name.match(/ATE|BOSCH|BREMBO|TEXTAR|TRW/i))
    ) {
      parts[key].favorite = true;
    }
  }
};

module.exports = filterParts;
