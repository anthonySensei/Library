const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Department = sequelize.define('department_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: 'You must enter department address' }
        }
    }
});

module.exports = Department;
