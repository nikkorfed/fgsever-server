require("dotenv").config();
require("module-alias/register");

const express = require("express");
const morgan = require("morgan");
const app = express();

const PORT = process.env.PORT || 3000;

const { cors } = require("./middleware");
const routes = require("./routes");

app.use(morgan("dev"));
app.use(cors);
app.use(routes);

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}...`));
