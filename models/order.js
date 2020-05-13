const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Order = sequelize.define('order_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    order_time: {
        type: Sequelize.DATE,
        allowNull: false
    },
    loan_time: {
        type: Sequelize.DATE,
        allowNull: true
    }
});

module.exports = Order;
