require("dotenv").config();
require("module-alias/register");
require("express-async-errors");

const express = require("express");
const path = require("path");
const app = express();

const { logger, upload, cors, query, error } = require("./middleware");
const routes = require("./routes");

const API_URL = process.env.API_URL || "/";
const PORT = process.env.PORT || 3000;

app.use(path.normalize(API_URL + "/static"), express.static("./public"));

app.use(logger);
app.use(upload);
app.use(express.json());
app.use(cors);
app.use(query);
app.use(API_URL, routes);
app.use(error);

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}...`));
