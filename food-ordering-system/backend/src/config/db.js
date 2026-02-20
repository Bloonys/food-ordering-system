const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("food_ordering", "dbeaver", "dbeaver123", {
  host: "localhost",
  dialect: "mariadb",
  port: 3306,
});

module.exports = sequelize;