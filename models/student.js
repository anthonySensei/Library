const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Student = sequelize.define('student_', {
    id: {
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
            notNull: { args: true, msg: 'Please fill in email' }
        }
    },
    profile_image: {
        type: Sequelize.STRING,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    registration_token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    reader_ticket: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: 'Please fill in reader ticket' }
        },
        unique: {
            args: true,
            msg: 'Reader ticket already in use'
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Student;
