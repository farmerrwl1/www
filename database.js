// db.js
const Sequelize = require('sequelize');


/*
module.exports = new Sequelize(
  "postgres://rivers_443g_user:YUqIjLJzwSB7XOlzYISR4DwIO4aBzYN9@dpg-cnef2ansc6pc73eg0scg-a.oregon-postgres.render.com/rivers_443g",
  
  {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Только если ваш сервер не использует подписанный SSL-сертификат
      },
    },
  }
);

*/



const sequelize = new Sequelize('rivers_443g', 'rivers_443g_user', 'YUqIjLJzwSB7XOlzYISR4DwIO4aBzYN9', {
  host: 'dpg-cnef2ansc6pc73eg0scg-a',
  dialect: 'postgres',
  port: 5432,
});

module.exports = sequelize;
