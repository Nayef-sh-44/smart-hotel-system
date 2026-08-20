import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const City = sequelize.define('City', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  best_visit_months: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  weather_description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  avg_daily_food_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  avg_daily_transport_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'cities',
  timestamps: false,
});

export default City;
