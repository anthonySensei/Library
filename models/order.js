const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Order = sequelize.define('order_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Order;
