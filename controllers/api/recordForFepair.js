const recordForFepair = require("../../models/recordForFepair");

module.exports = {
  async addRecordForFepair(req, res) {
    try {
      console.log(req.body);
      const {
        body: { avto, text, userId },
      } = req;

      let img = "";
      const picture = req?.files?.file;
      if (picture) {
        const random = Date.now();
        picture.mv(`${__dirname}/../../public/images/defects/${random}_${picture.name}`, (err) => {
          if (err) {
            console.log(err);
            throw new Error({ message: "Ошибка при добавлении изображеня!" });
          }
        });
        img = `images/defect/${random}_${picture.name}`;
      }

      const newAplication = await recordForFepair.create({
        avto,
        text,
        userId,
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
