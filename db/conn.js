/*const {Sequelize} = require("sequelize");
const sequelize = new Sequelize('teste2', 'sistema','sa.123',{
    dialect: 'postgres',
    host: '192.168.1.89'
})
module.exports = sequelize*/

const { Sequelize } = require("sequelize");

const databaseUrl =
  "postgres://gneyikls:LrqieYmFQVopYebPgWz11teeTGgcPCvq@silly.db.elephantsql.com/gneyikls";

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // isso pode ser necessário se o certificado SSL for autofirmado
    },
  },
  logging: false, // opcional: desativa logs SQL no console
});

module.exports = sequelize;
