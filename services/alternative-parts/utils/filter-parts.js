const partition = require("./partition");

let filterParts = (parts, config) => {
  markFavorites(parts);

  if (config.onlyFavorites === true) {
    const [favoriteAnalogs] = partition(parts, (part) => part.favorite);
    parts = favoriteAnalogs;
  }

  return parts;
};

let markFavorites = (parts) => {
  for (const key in parts) {
    let { name, description } = parts[key];
    if (
      (description?.match(/фильтр воздушный|фильтр салона/i) && name.match(/Оригинал|BMW|KNECHT|MANN-FILTER|BOSCH|CORTECO|MAHLE/i)) ||
      (description?.match(/фильтр/i) && name.match(/Оригинал|BMW|KNECHT|MANN-FILTER|MAHLE/i)) ||
      (description?.match(/свеча/i) && name.match(/Оригинал|BMW|CHAMPION|BOSCH|NGK/i)) ||
      (description?.match(/тормоз|датчик|диск|disc/i) && name.match(/Оригинал|BMW|ATE|BOSCH|BREMBO|TEXTAR|TRW/i))
    ) {
      parts[key].favorite = true;
    }
  }
};

module.exports = filterParts;
