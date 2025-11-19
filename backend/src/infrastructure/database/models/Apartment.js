const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

class Apartment extends Model {}

Apartment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tower: {
    type: DataTypes.STRING,
    allowNull: false
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  assignedUserId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  assignedRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'vacant'
  },
  type: {
    type: DataTypes.STRING,
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
  modelName: 'Apartment',
  tableName: 'apartments',
  timestamps: true
});

module.exports = Apartment;
