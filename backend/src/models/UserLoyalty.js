import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserLoyalty = sequelize.define('UserLoyalty', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  level_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  current_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lifetime_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_loyalty',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

export default UserLoyalty;
