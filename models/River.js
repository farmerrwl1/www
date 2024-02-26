// models/River.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class River extends Model {}

River.init({
  // Определение полей модели данных реки
  name: DataTypes.STRING,
  length: DataTypes.FLOAT
}, { sequelize, modelName: 'river' });

module.exports = River;
