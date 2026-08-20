import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SavedComparison = sequelize.define('SavedComparison', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hotel_ids: {
    type: DataTypes.STRING,
    allowNull: false,
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
  tableName: 'saved_comparisons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default SavedComparison;
