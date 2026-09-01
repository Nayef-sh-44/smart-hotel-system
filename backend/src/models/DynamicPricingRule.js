import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DynamicPricingRule = sequelize.define('DynamicPricingRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  season_factor: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
  occupancy_factor: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
  event_factor: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
  weekend_factor: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
  manual_factor: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
  // New fields for date-based pricing
  rule_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rule_target: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  multiplier: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
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
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'dynamic_pricing_rules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default DynamicPricingRule;
