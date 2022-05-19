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
      (description?.match(/фильтр воздушный|фильтр салона/i) && name.match(/BMW|KNECHT|MANN|MANN-FILTER|BOSCH|CORTECO|MAHLE/i)) ||
      (description?.match(/фильтр/i) && name.match(/BMW|KNECHT|MANN|MAHLE/i)) ||
      (description?.match(/свеча/i) && name.match(/BMW|CHAMPION|BOSCH|NGK/i)) ||
      (description?.match(/тормоз|датчик|диск|disc/i) && name.match(/BMW|ATE|BOSCH|BREMBO|TEXTAR|TRW/i))
    ) {
      parts[key].favorite = true;
    }
  }
};

let partition = (object, callback) => {
  const truthy = {};
  const falsy = {};

  for (const key in object) {
    callback(object[key]) ? (truthy[key] = object[key]) : (falsy[key] = object[key]);
  }

  return [truthy, falsy];
};

module.exports = filterParts;
