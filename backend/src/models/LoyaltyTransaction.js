import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  transaction_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'loyalty_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default LoyaltyTransaction;
