const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

class AirbnbGuest extends Model {}

AirbnbGuest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  relationId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  guestName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guestCedula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numberOfGuests: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  apartmentType: {
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
  modelName: 'AirbnbGuest',
  tableName: 'airbnb_guests',
  timestamps: true
});

module.exports = AirbnbGuest;
