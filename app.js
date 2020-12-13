const express = require("express");
const app = express();

app.use("/aos-parser", require("./aos-parser"));
app.use("/upgrade-calculator", require("./upgrade-calculator"));

app.listen(80, () => {
  console.log("Сервер запущен на порту 80...");
});
