import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Amenity = sequelize.define('Amenity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  icon_class: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'general',
  },
  weight_importance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
}, {
  tableName: 'amenities',
  timestamps: false,
});

export default Amenity;
