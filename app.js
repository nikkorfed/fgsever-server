const express = require("express");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  return next();
});

app.use("/aos-parser", require("./aos-parser"));
app.use("/upgrade-calculator", require("./upgrade-calculator"));
app.use("/survey", require("./survey"));

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}...`));
