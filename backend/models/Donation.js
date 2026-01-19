const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Donation = sequelize.define('Donation', {
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending, success, failed
  razorpay_order_id: { type: DataTypes.STRING, allowNull: false },
  razorpay_payment_id: { type: DataTypes.STRING, allowNull: true }
});

// Relationships
User.hasMany(Donation, { foreignKey: 'userId' });
Donation.belongsTo(User, { foreignKey: 'userId' });

module.exports = Donation;