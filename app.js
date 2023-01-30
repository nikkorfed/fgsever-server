require("dotenv").config();
require("module-alias/register");

const fileUpload = require('express-fileupload');
const path = require('path')
const express = require("express");
const morgan = require("morgan");
const app = express();

const PORT = process.env.PORT || 3000;

const { cors, query } = require("./middleware");
const routes = require("./routes");

app.use(morgan("dev"));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")))
app.use(cors);
app.use(query);
app.use(routes);

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}...`));
