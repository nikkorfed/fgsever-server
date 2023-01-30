module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('users', [{
      name: 'John12',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
