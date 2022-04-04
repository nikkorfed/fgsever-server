const express = require("express");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const { cors } = require("./middleware");
const routes = require("./routes");

app.use(cors);
app.use(routes);

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}...`));
