const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("foodDB", "foodeater", "666666", {
  host: "localhost",
  dialect: "mariadb",
  port: 3306,
});

module.exports = sequelize;