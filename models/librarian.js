const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Librarian = sequelize.define('librarian_', {
    id: {
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
        },
        unique: {
            args: true,
            msg: 'Email already in use'
        }
    },
    profile_image: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Librarian;
