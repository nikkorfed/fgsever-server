module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('recordForFepair', [{
      userId: "12",
      avto: "mer",
      text: "dfdfd",
      img: "image",
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('recordForFepair', null, {});
  },
};
