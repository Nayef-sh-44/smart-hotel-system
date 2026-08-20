import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FlashDeal = sequelize.define('FlashDeal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  discount_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'percentage',
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  start_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  remaining_rooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  active_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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
  tableName: 'flash_deals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default FlashDeal;
