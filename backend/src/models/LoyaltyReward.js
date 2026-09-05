import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoyaltyReward = sequelize.define('LoyaltyReward', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reward_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reward_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reward_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  points_cost: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'loyalty_rewards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default LoyaltyReward;
