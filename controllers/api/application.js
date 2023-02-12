const application = require("../../models/application");

module.exports = {
  async addApplication(req, res) {
    try {
      const { name, phone, car, service, date, problem } = JSON.parse(req?.body?.data);
      let img = [];
      const picture = Object.values(req?.files);
      if (picture) {
        const random = Date.now();
        picture.map(async item => {
          await item.mv(`${__dirname}/../../public/images/defects/${random}_${item.name}`, (err) => {
            if (err) {
              console.log(err);
              throw new Error({ message: "Ошибка при добавлении изображеня!" });
            }
          });
          img.push(`images/defect/${random}_${item.name}`);
        })
      }

      const newAplication = await application.create({
        name,
        phone,
        car,
        service,
        date,
        problem,
        img,
      });
      return res.status(201).send({
        message: "Запись успешно добавлена!",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Ошибка! Невозможно добавить запись",
      });
    }
  },
};

