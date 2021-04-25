const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Period = sequelize.define('period_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    start: {
        type: Sequelize.STRING,
        allowNull: false
    },
    end: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Period;
