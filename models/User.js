// models/User.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');
const River = require('./River');

class User extends Model {}

User.init({
  // Определение полей модели данных пользователя
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.STRING // Поле для определения роли пользователя
}, { sequelize, modelName: 'user' });

// Определение связей между пользователями и реками
User.belongsToMany(River, { through: 'Favorite' });
River.belongsToMany(User, { through: 'Favorite' });

module.exports = User;
