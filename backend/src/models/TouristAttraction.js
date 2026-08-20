import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TouristAttraction = sequelize.define('TouristAttraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  distance_km: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tourist_attractions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default TouristAttraction;
