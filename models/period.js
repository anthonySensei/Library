const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Period = sequelize.define('period_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    start_time: {
        type: Sequelize.DATE,
        allowNull: false
    },
    end_time: {
        type: Sequelize.DATE,
        allowNull: false
    }
});

module.exports = Period;
