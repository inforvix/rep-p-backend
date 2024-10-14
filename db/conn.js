const {Sequelize} = require("sequelize");
const sequelize = new Sequelize('repp', 'postgres','masterkey',{
    dialect: 'postgres',
    host: 'localhost'
})
module.exports = sequelize


// const {Sequelize} = require("sequelize");
// const sequelize = new Sequelize('repp', 'postgres','masterkey',{
//     dialect: 'postgres',
//     host: 'localhost'
// })
// module.exports = sequelize


/*
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
*/