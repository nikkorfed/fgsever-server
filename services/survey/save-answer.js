const fs = require("fs/promises");

let saveAnswer = async (name, data) => {
  await fs.mkdir(__dirname + `/data/${name}`).catch(() => null);
  await fs.writeFile(__dirname + `/data/${name}/${Date.now()}.json`, JSON.stringify(data, null, 2));
};

module.exports = saveAnswer;
