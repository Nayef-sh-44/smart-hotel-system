import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoyaltyConfig = sequelize.define('LoyaltyConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  points_per_currency: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  currency_spent_required: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'loyalty_config',
  timestamps: false,
});

export default LoyaltyConfig;
