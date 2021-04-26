const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Schedule = sequelize.define('schedule_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    day: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Schedule;
