// Импортируем библиотеку Sequelize
const { DataTypes } = require('sequelize');
// Импортируем объект sequelize, который представляет подключение к базе данных
const sequelize = require('../database');
const River = require('./River');
const User = require('./User');


// Определяем модель FavoriteItem
const FavoriteItem = sequelize.define('FavoriteItem', {
  // Определяем атрибуты модели
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // Атрибут для связи с моделью River
  riverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Атрибут для связи с моделью User
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Определяем связи между моделями FavoriteItem, River и User
FavoriteItem.belongsTo(River);
FavoriteItem.belongsTo(User);

// Экспортируем модель FavoriteItem, чтобы она была доступна в других частях приложения
module.exports = FavoriteItem;
