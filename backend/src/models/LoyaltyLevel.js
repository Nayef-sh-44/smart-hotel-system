import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoyaltyLevel = sequelize.define('LoyaltyLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  level_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  min_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'loyalty_levels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default LoyaltyLevel;
