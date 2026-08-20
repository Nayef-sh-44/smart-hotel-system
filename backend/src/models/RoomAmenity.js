import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RoomAmenity = sequelize.define('RoomAmenity', {
  room_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  amenity_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'room_amenities',
  timestamps: false,
});

export default RoomAmenity;
