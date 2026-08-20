import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cleanliness_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
  },
  location_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
  },
  service_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
  },
  value_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
  },
  overall_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Review;
