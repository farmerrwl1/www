// db.js
const Sequelize = require('sequelize');

const sequelize = new Sequelize('rivers_443g', 'rivers_443g_user', 'YUqIjLJzwSB7XOlzYISR4DwIO4aBzYN9', {
  host: 'dpg-cnef2ansc6pc73eg0scg-a',
  dialect: 'postgres',
  port: 5432,
});

module.exports = sequelize;
