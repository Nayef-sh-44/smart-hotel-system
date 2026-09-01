import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address: {
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
  star_rating: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
  },
  base_price_per_night: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  check_in_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  check_out_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'EUR',
  },
  primary_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gallery_images_json: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'hotels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Hotel;
