import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserRewardInstance = sequelize.define('UserRewardInstance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reward_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_redeemed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  booking_reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  redeemed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'user_reward_instances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default UserRewardInstance;
