import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HotelAmenity = sequelize.define('HotelAmenity', {
  hotel_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  amenity_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  additional_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  tableName: 'hotel_amenities',
  timestamps: false,
});

export default HotelAmenity;
