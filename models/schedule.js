const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Schedule = sequelize.define('schedule_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    dayOfWeek: {
        type: Sequelize.STRING,
        allowNull: false
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

module.exports = Schedule;
