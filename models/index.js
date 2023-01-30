const User = require("./user");
module.exports = { User };
const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: "localhost",
  dialect: "postgres",
});

sequelize
  .sync()
  .then((result) => {
    console.log("Подключено успешно");
  })
  .catch((err) => console.log(err));

module.exports = sequelize;
