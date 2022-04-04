const fs = require("fs/promises");

let saveAnswer = async (data) => await fs.writeFile(__dirname + `/data/${Date.now()}.json`, JSON.stringify(data, null, 2));

module.exports = saveAnswer;
