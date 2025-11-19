const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

class DamageReport extends Model {}

DamageReport.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  apartmentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reportedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'low'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'reported'
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'DamageReport',
  tableName: 'damage_reports',
  timestamps: true
});

module.exports = DamageReport;
